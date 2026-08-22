from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from fastapi import HTTPException, status
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate

def get_user_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    tx_type: Optional[str] = None
):
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if tx_type:
        query = query.filter(Transaction.type == tx_type)
    
    total = query.count()
    items = query.order_by(desc(Transaction.date)).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_transaction(db: Session, user_id: int, data: TransactionCreate):
    tx = Transaction(
        user_id=user_id,
        type=data.type,
        amount=data.amount,
        category_id=data.category_id,
        description=data.description,
        payment_method=data.payment_method,
        date=data.date,
        status=data.status or "completed"
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def update_transaction(db: Session, user_id: int, tx_id: int, data: TransactionUpdate):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(tx, key, value)

    db.commit()
    db.refresh(tx)
    return tx

def delete_transaction(db: Session, user_id: int, tx_id: int):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    
    db.delete(tx)
    db.commit()
    return True
