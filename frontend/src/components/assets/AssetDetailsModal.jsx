import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Pencil, TrendingUp, Calendar, Building, User, Wallet } from 'lucide-react';

const AssetDetailsModal = ({ isOpen, onClose, asset, onEdit }) => {
  if (!asset) return null;

  const gain = asset.current_value - (asset.purchase_value || 0);
  const gainPercent = asset.purchase_value > 0 
    ? ((gain / asset.purchase_value) * 100).toFixed(1) 
    : 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getAssetIcon = (type) => {
    const icons = {
      super: '🏦',
      shares: '📈',
      etf: '📊',
      crypto: '🪙',
      cash: '💵',
      bonds: '📜',
      managed_fund: '💼',
      term_deposit: '🔒',
      other: '💰',
    };
    return icons[type] || '💰';
  };

  const getAssetLabel = (type) => {
    const labels = {
      super: 'Superannuation',
      shares: 'Shares',
      etf: 'ETF',
      crypto: 'Cryptocurrency',
      cash: 'Cash/Savings',
      bonds: 'Bonds',
      managed_fund: 'Managed Fund',
      term_deposit: 'Term Deposit',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getTaxLabel = (env) => {
    const labels = {
      taxable: 'Taxable',
      tax_deferred: 'Tax Deferred',
      tax_free: 'Tax Free',
    };
    return labels[env] || env;
  };

  const annualContribution = asset.contributions?.amount 
    ? asset.contributions.amount * ({
        weekly: 52,
        fortnightly: 26,
        monthly: 12,
        quarterly: 4,
        annual: 1,
      }[asset.contributions.frequency] || 12)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getAssetIcon(asset.type)}</span>
              <div>
                <DialogTitle className="text-xl">{asset.name}</DialogTitle>
                <p className="text-sm text-gray-500">{getAssetLabel(asset.type)}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(asset.current_value)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Total Gain/Loss</p>
                <p className={`text-xl font-bold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Return</p>
                <p className={`text-xl font-bold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gain >= 0 ? '+' : ''}{gainPercent}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Expected Return</p>
                <p className="text-xl font-bold text-blue-600">
                  {asset.expected_return}% p.a.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Asset Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Asset Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{getAssetLabel(asset.type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium capitalize">
                  {asset.owner === 'you' ? 'You' : asset.owner === 'partner' ? 'Partner' : 'Joint'}
                </p>
              </div>
              {asset.institution && (
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="font-medium">{asset.institution}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Tax Environment</p>
                <Badge variant="outline">{getTaxLabel(asset.tax_environment)}</Badge>
              </div>
              {asset.ticker && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Ticker</p>
                    <p className="font-medium font-mono">{asset.ticker}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Units Held</p>
                    <p className="font-medium">{asset.units?.toLocaleString()}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Purchase Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Purchase Value</p>
                <p className="font-medium">{formatCurrency(asset.purchase_value)}</p>
              </div>
              {asset.purchase_date && (
                <div>
                  <p className="text-sm text-gray-500">Purchase Date</p>
                  <p className="font-medium">
                    {new Date(asset.purchase_date).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contributions */}
          {asset.contributions?.amount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Regular Contributions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">
                    {formatCurrency(asset.contributions.amount)} / {asset.contributions.frequency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Annual Total</p>
                  <p className="font-medium">{formatCurrency(annualContribution)}</p>
                </div>
                {asset.contributions.employer_contribution > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Employer Contribution</p>
                    <p className="font-medium">
                      {formatCurrency(asset.contributions.employer_contribution)} / {asset.contributions.frequency}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Contribution Growth</p>
                  <p className="font-medium">{asset.contributions.growth_rate}% p.a.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {asset.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">{asset.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailsModal;
