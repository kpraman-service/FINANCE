from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from typing import Optional
from datetime import datetime
from fastapi import HTTPException, status
from app.models.budget import Budget
from app.models.budget_category import BudgetCategory
from app.models.expense import Expense
from app.schemas.budget import BudgetCreate

def get_or_create_monthly_budget(db: Session, user_id: int, month: Optional[int] = None, year: Optional[int] = None):
    now = datetime.utcnow()
    month = month or now.month
    year = year or now.year

    budget = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == month,
        Budget.year == year
    ).first()

    if not budget:
        return None

    return get_budget_details(db, budget.id, user_id)

def get_budget_details(db: Session, budget_id: int, user_id: int):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")

    categories_resp = []
    total_used = 0.0

    for bc in budget.budget_categories:
        # Sum expenses for this category in this month/year
        used = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == user_id,
            Expense.category_id == bc.category_id,
            extract('month', Expense.date) == budget.month,
            extract('year', Expense.date) == budget.year
        ).scalar() or 0.0

        used = float(used)
        allocated = float(bc.allocated_amount)
        remaining = allocated - used
        pct = (used / allocated * 100.0) if allocated > 0 else 0.0

        total_used += used

        categories_resp.append({
            "id": bc.id,
            "category_id": bc.category_id,
            "allocated_amount": allocated,
            "used_amount": used,
            "remaining_amount": remaining,
            "percentage_used": pct,
            "category": bc.category
        })

    tot_amount = float(budget.total_amount)
    tot_remaining = tot_amount - total_used
    tot_pct = (total_used / tot_amount * 100.0) if tot_amount > 0 else 0.0

    if tot_pct > 100:
        budget_status = "Over Budget"
    elif tot_pct > 80:
        budget_status = "Caution"
    else:
        budget_status = "On Track"

    return {
        "id": budget.id,
        "user_id": budget.user_id,
        "month": budget.month,
        "year": budget.year,
        "total_amount": tot_amount,
        "created_at": budget.created_at,
        "updated_at": budget.updated_at,
        "total_used": total_used,
        "total_remaining": tot_remaining,
        "percentage_used": tot_pct,
        "status": budget_status,
        "categories": categories_resp
    }

def create_or_update_budget(db: Session, user_id: int, data: BudgetCreate):
    existing = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == data.month,
        Budget.year == data.year
    ).first()

    sum_allocated = sum(c.allocated_amount for c in data.category_budgets)
    if sum_allocated > data.total_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category budget allocations exceed total monthly budget"
        )

    if existing:
        existing.total_amount = data.total_amount
        db.query(BudgetCategory).filter(BudgetCategory.budget_id == existing.id).delete()
        budget = existing
    else:
        budget = Budget(
            user_id=user_id,
            month=data.month,
            year=data.year,
            total_amount=data.total_amount
        )
        db.add(budget)
        db.flush()

    for bc in data.category_budgets:
        budget_cat = BudgetCategory(
            budget_id=budget.id,
            category_id=bc.category_id,
            allocated_amount=bc.allocated_amount
        )
        db.add(budget_cat)

    db.commit()
    db.refresh(budget)
    return get_budget_details(db, budget.id, user_id)

def delete_budget(db: Session, user_id: int, budget_id: int):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return True
