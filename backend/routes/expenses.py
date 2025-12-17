from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone

from models.expense import Expense, ExpenseCreate, ExpenseUpdate, EXPENSE_CATEGORIES
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("/categories")
async def get_expense_categories():
    """Get list of expense categories"""
    return {"categories": EXPENSE_CATEGORIES}


@router.get("/portfolio/{portfolio_id}", response_model=List[Expense])
async def get_portfolio_expenses(portfolio_id: str):
    """Get all expenses for a portfolio"""
    expenses = await db.expenses.find(
        {"portfolio_id": portfolio_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    ).to_list(100)
    return expenses


@router.post("", response_model=Expense)
async def create_expense(data: ExpenseCreate):
    """Create a new expense"""
    expense = Expense(
        user_id=DEV_USER_ID,
        portfolio_id=data.portfolio_id,
        name=data.name,
        category=data.category,
        amount=data.amount,
        frequency=data.frequency,
        inflation_rate=data.inflation_rate,
        start_date=data.start_date,
        end_date=data.end_date,
        retirement_percentage=data.retirement_percentage,
        is_tax_deductible=data.is_tax_deductible
    )
    
    doc = expense.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.expenses.insert_one(doc)
    return expense


@router.put("/{expense_id}", response_model=Expense)
async def update_expense(expense_id: str, data: ExpenseUpdate):
    """Update an expense"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.expenses.update_one(
        {"id": expense_id, "user_id": DEV_USER_ID},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    return expense


@router.delete("/{expense_id}")
async def delete_expense(expense_id: str):
    """Delete an expense"""
    result = await db.expenses.delete_one(
        {"id": expense_id, "user_id": DEV_USER_ID}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return {"message": "Expense deleted successfully"}
