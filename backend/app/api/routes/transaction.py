from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.auth.security import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from app.services import transaction_service

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=dict)
def list_transactions(
    skip: int = 0,
    limit: int = 20,
    type: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return transaction_service.get_user_transactions(db, current_user.id, skip, limit, type)

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create(
    data: TransactionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return transaction_service.create_transaction(db, current_user.id, data)

@router.put("/{tx_id}", response_model=TransactionResponse)
def update(
    tx_id: int,
    data: TransactionUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return transaction_service.update_transaction(db, current_user.id, tx_id, data)

@router.delete("/{tx_id}")
def delete(
    tx_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction_service.delete_transaction(db, current_user.id, tx_id)
    return {"message": "Transaction deleted successfully"}
