/**
 * Loan Manager Component
 * CRUD interface for managing property loans
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import {
    Plus,
    Edit2,
    Trash2,
    Building,
    Percent,
    DollarSign,
    Calendar,
    CreditCard,
} from 'lucide-react';

const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const LoanCard = ({ loan, onEdit, onDelete }) => {
    const monthlyRepayment = loan.loan_structure === 'InterestOnly'
        ? (loan.current_amount * (loan.interest_rate / 100)) / 12
        : loan.current_amount * (
            (loan.interest_rate / 100 / 12) *
            Math.pow(1 + loan.interest_rate / 100 / 12, loan.remaining_term_years * 12)
        ) / (Math.pow(1 + loan.interest_rate / 100 / 12, loan.remaining_term_years * 12) - 1);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">{loan.lender_name}</h3>
                        <p className="text-sm text-gray-500">{loan.loan_type}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(loan)}>
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(loan.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Current Balance</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(loan.current_amount)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Interest Rate</p>
                        <p className="text-xl font-bold text-purple-600">{loan.interest_rate}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Structure</p>
                        <p className="text-sm font-medium text-gray-700">
                            {loan.loan_structure === 'InterestOnly' ? 'Interest Only' : 'P&I'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Term Remaining</p>
                        <p className="text-sm font-medium text-gray-700">{loan.remaining_term_years} years</p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Est. Monthly Repayment</span>
                        <span className="font-semibold text-green-600">{formatCurrency(monthlyRepayment)}</span>
                    </div>
                    {loan.offset_balance > 0 && (
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-500">Offset Balance</span>
                            <span className="font-semibold text-blue-600">{formatCurrency(loan.offset_balance)}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const LoanFormModal = ({ isOpen, onClose, onSubmit, loan, propertyId }) => {
    const [formData, setFormData] = useState({
        property_id: propertyId,
        lender_name: '',
        loan_type: 'PrincipalLoan',
        loan_structure: 'PrincipalAndInterest',
        original_amount: '',
        current_amount: '',
        interest_rate: '',
        loan_term_years: 30,
        remaining_term_years: 30,
        interest_only_period_years: 0,
        repayment_frequency: 'Monthly',
        offset_balance: 0,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (loan) {
            setFormData({
                property_id: loan.property_id,
                lender_name: loan.lender_name,
                loan_type: loan.loan_type,
                loan_structure: loan.loan_structure,
                original_amount: loan.original_amount,
                current_amount: loan.current_amount,
                interest_rate: loan.interest_rate,
                loan_term_years: loan.loan_term_years,
                remaining_term_years: loan.remaining_term_years,
                interest_only_period_years: loan.interest_only_period_years || 0,
                repayment_frequency: loan.repayment_frequency,
                offset_balance: loan.offset_balance || 0,
            });
        } else {
            setFormData(prev => ({
                ...prev,
                property_id: propertyId,
                lender_name: '',
                original_amount: '',
                current_amount: '',
                interest_rate: '',
            }));
        }
    }, [loan, propertyId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                original_amount: parseFloat(formData.original_amount),
                current_amount: parseFloat(formData.current_amount) || parseFloat(formData.original_amount),
                interest_rate: parseFloat(formData.interest_rate),
                offset_balance: parseFloat(formData.offset_balance) || 0,
            });
            onClose();
        } catch (error) {
            console.error('Failed to save loan:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{loan ? 'Edit Loan' : 'Add New Loan'}</DialogTitle>
                    <DialogDescription>
                        {loan ? 'Update the loan details below.' : 'Enter the loan details to add it to this property.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="lender_name">Lender Name</Label>
                        <Input
                            id="lender_name"
                            value={formData.lender_name}
                            onChange={(e) => setFormData({ ...formData, lender_name: e.target.value })}
                            placeholder="e.g., CommBank, ANZ"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="loan_type">Loan Type</Label>
                            <Select
                                value={formData.loan_type}
                                onValueChange={(value) => setFormData({ ...formData, loan_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PrincipalLoan">Principal Loan</SelectItem>
                                    <SelectItem value="EquityLoan">Equity Loan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="loan_structure">Structure</Label>
                            <Select
                                value={formData.loan_structure}
                                onValueChange={(value) => setFormData({ ...formData, loan_structure: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PrincipalAndInterest">P&I</SelectItem>
                                    <SelectItem value="InterestOnly">Interest Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="original_amount">Original Amount ($)</Label>
                            <Input
                                id="original_amount"
                                type="number"
                                value={formData.original_amount}
                                onChange={(e) => setFormData({ ...formData, original_amount: e.target.value })}
                                placeholder="500000"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="current_amount">Current Balance ($)</Label>
                            <Input
                                id="current_amount"
                                type="number"
                                value={formData.current_amount}
                                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                                placeholder="Leave blank to use original"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                            <Input
                                id="interest_rate"
                                type="number"
                                step="0.01"
                                value={formData.interest_rate}
                                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                placeholder="6.25"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="remaining_term_years">Remaining Term (years)</Label>
                            <Input
                                id="remaining_term_years"
                                type="number"
                                value={formData.remaining_term_years}
                                onChange={(e) => setFormData({ ...formData, remaining_term_years: parseInt(e.target.value) })}
                                placeholder="30"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="offset_balance">Offset Account Balance ($)</Label>
                        <Input
                            id="offset_balance"
                            type="number"
                            value={formData.offset_balance}
                            onChange={(e) => setFormData({ ...formData, offset_balance: e.target.value })}
                            placeholder="0"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="bg-lime-400 text-gray-900 hover:bg-lime-500">
                            {submitting ? 'Saving...' : loan ? 'Update Loan' : 'Add Loan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const LoanManager = ({ propertyId, propertyAddress }) => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);

    const fetchLoans = useCallback(async () => {
        if (!propertyId) return;

        try {
            setLoading(true);
            const data = await api.getPropertyLoans(propertyId);
            setLoans(data);
        } catch (error) {
            console.error('Failed to fetch loans:', error);
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const handleAddLoan = () => {
        setSelectedLoan(null);
        setIsFormOpen(true);
    };

    const handleEditLoan = (loan) => {
        setSelectedLoan(loan);
        setIsFormOpen(true);
    };

    const handleDeleteLoan = async (loanId) => {
        if (!window.confirm('Are you sure you want to delete this loan?')) return;

        try {
            await api.deleteLoan(loanId);
            setLoans(prev => prev.filter(l => l.id !== loanId));
        } catch (error) {
            console.error('Failed to delete loan:', error);
        }
    };

    const handleSubmit = async (loanData) => {
        try {
            if (selectedLoan) {
                const updated = await api.updateLoan(selectedLoan.id, loanData);
                setLoans(prev => prev.map(l => l.id === selectedLoan.id ? updated : l));
            } else {
                const newLoan = await api.createLoan(loanData);
                setLoans(prev => [...prev, newLoan]);
            }
        } catch (error) {
            console.error('Failed to save loan:', error);
            throw error;
        }
    };

    // Calculate totals
    const totalDebt = loans.reduce((sum, loan) => sum + parseFloat(loan.current_amount || 0), 0);
    const totalOffset = loans.reduce((sum, loan) => sum + parseFloat(loan.offset_balance || 0), 0);
    const effectiveDebt = totalDebt - totalOffset;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Loans</h2>
                    <p className="text-gray-500">{propertyAddress}</p>
                </div>
                <Button
                    onClick={handleAddLoan}
                    className="bg-lime-400 text-gray-900 hover:bg-lime-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Loan
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Debt</p>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalDebt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Offset</p>
                                <p className="text-xl font-bold text-blue-600">{formatCurrency(totalOffset)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Percent className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Effective Debt</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(effectiveDebt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Loans Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <Card key={i} className="h-48 animate-pulse bg-gray-100" />
                    ))}
                </div>
            ) : loans.length === 0 ? (
                <Card className="p-8">
                    <div className="text-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans yet</h3>
                        <p className="text-gray-500 mb-4">Add your first loan to start tracking</p>
                        <Button
                            onClick={handleAddLoan}
                            className="bg-lime-400 text-gray-900 hover:bg-lime-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Loan
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loans.map((loan) => (
                        <LoanCard
                            key={loan.id}
                            loan={loan}
                            onEdit={handleEditLoan}
                            onDelete={handleDeleteLoan}
                        />
                    ))}
                </div>
            )}

            {/* Form Modal */}
            <LoanFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmit}
                loan={selectedLoan}
                propertyId={propertyId}
            />
        </div>
    );
};

export default LoanManager;
