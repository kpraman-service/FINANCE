from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime
from fastapi import HTTPException, status
from app.models.savings_goal import SavingsGoal
from app.models.savings_transaction import SavingsTransaction
from app.schemas.savings import SavingsGoalCreate, SavingsGoalUpdate, SavingsTransactionCreate

def format_savings_goal(goal: SavingsGoal):
    target = float(goal.target_amount)
    current = float(goal.current_amount or 0.0)
    pct = (current / target * 100.0) if target > 0 else 0.0
    days_left = (goal.target_date - datetime.utcnow()).days if goal.target_date else 0

    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "title": goal.title,
        "target_amount": target,
        "current_amount": current,
        "target_date": goal.target_date,
        "status": goal.status,
        "percentage_completed": pct,
        "days_remaining": max(0, days_left),
        "created_at": goal.created_at,
        "updated_at": goal.updated_at
    }

def get_savings_goals(db: Session, user_id: int, status_filter: Optional[str] = None):
    query = db.query(SavingsGoal).filter(SavingsGoal.user_id == user_id)
    if status_filter:
        query = query.filter(SavingsGoal.status == status_filter)

    goals = query.order_by(desc(SavingsGoal.created_at)).all()
    return [format_savings_goal(g) for g in goals]

def create_savings_goal(db: Session, user_id: int, data: SavingsGoalCreate):
    goal = SavingsGoal(
        user_id=user_id,
        title=data.title,
        target_amount=data.target_amount,
        current_amount=0.0,
        target_date=data.target_date,
        status="active"
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return format_savings_goal(goal)

def update_savings_goal(db: Session, user_id: int, goal_id: int, data: SavingsGoalUpdate):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)
    return format_savings_goal(goal)

def delete_savings_goal(db: Session, user_id: int, goal_id: int):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found")

    db.delete(goal)
    db.commit()
    return True

def deposit_to_savings_goal(db: Session, user_id: int, goal_id: int, data: SavingsTransactionCreate):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found")
    if goal.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Goal already completed")

    goal.current_amount = float(goal.current_amount or 0.0) + data.amount
    if goal.current_amount >= float(goal.target_amount):
        goal.status = "completed"

    tx = SavingsTransaction(
        savings_goal_id=goal.id,
        amount=data.amount,
        type="deposit",
        date=datetime.utcnow()
    )
    db.add(tx)
    db.commit()
    db.refresh(goal)
    return format_savings_goal(goal)

def withdraw_from_savings_goal(db: Session, user_id: int, goal_id: int, data: SavingsTransactionCreate):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found")

    current = float(goal.current_amount or 0.0)
    if data.amount > current:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Withdrawal amount exceeds current savings")

    goal.current_amount = current - data.amount
    if goal.current_amount < float(goal.target_amount) and goal.status == "completed":
        goal.status = "active"

    tx = SavingsTransaction(
        savings_goal_id=goal.id,
        amount=data.amount,
        type="withdrawal",
        date=datetime.utcnow()
    )
    db.add(tx)
    db.commit()
    db.refresh(goal)
    return format_savings_goal(goal)
