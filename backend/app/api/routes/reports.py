import csv
import io
from fastapi import APIRouter, Depends, Response, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.auth.security import get_current_user
from app.services import analytics_service, expense_service, income_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/monthly")
def generate_monthly_report(
    month: Optional[int] = None,
    year: Optional[int] = None,
    format: str = Query("json", pattern="^(json|csv)$"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    m = month or now.month
    y = year or now.year

    month_str = f"{y}-{m:02d}"
    summary = analytics_service.get_analytics_summary(db, current_user.id, month_str)
    expenses = expense_service.get_user_expenses(db, current_user.id, limit=500)["items"]
    income = income_service.get_user_income(db, current_user.id, limit=500)["items"]

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["MONTHLY FINANCIAL REPORT", f"{m}/{y}"])
        writer.writerow([])
        writer.writerow(["SUMMARY METRICS"])
        writer.writerow(["Total Income", summary["total_income"]])
        writer.writerow(["Total Expenses", summary["total_expenses"]])
        writer.writerow(["Total Savings", summary["total_savings"]])
        writer.writerow(["Savings Rate (%)", summary["savings_rate"]])
        writer.writerow(["Financial Health", summary["financial_health"]])
        writer.writerow([])

        writer.writerow(["EXPENSES LEDGER"])
        writer.writerow(["Date", "Category", "Description", "Amount", "Payment Method"])
        for exp in expenses:
            cat_name = exp.category.name if exp.category else "N/A"
            writer.writerow([exp.date, cat_name, exp.description or "", exp.amount, exp.payment_method or ""])

        writer.writerow([])
        writer.writerow(["INCOME LEDGER"])
        writer.writerow(["Date", "Source", "Description", "Amount"])
        for inc in income:
            writer.writerow([inc.date, inc.source, inc.description or "", inc.amount])

        response = Response(content=output.getvalue(), media_type="text/csv")
        response.headers["Content-Disposition"] = f"attachment; filename=report_{m}_{y}.csv"
        return response

    return {
        "report_period": f"{m}/{y}",
        "summary": summary,
        "expense_count": len(expenses),
        "income_count": len(income)
    }
