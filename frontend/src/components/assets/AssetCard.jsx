import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  TrendingUp,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const AssetCard = ({ asset, onView, onEdit, onDelete }) => {
  const gain = asset.current_value - (asset.purchase_value || 0);
  const gainPercent = asset.purchase_value > 0
    ? ((gain / asset.purchase_value) * 100).toFixed(1)
    : 0;

  const getAssetIcon = (type) => {
    switch (type) {
      case 'super':
        return '🏦';
      case 'shares':
        return '📈';
      case 'etf':
        return '📊';
      case 'crypto':
        return '🪙';
      case 'cash':
        return '💵';
      case 'bonds':
        return '📜';
      case 'managed_fund':
        return '💼';
      case 'term_deposit':
        return '🔒';
      default:
        return '💰';
    }
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

  const getTaxBadgeColor = (env) => {
    switch (env) {
      case 'tax_deferred':
        return 'bg-purple-100 text-purple-700';
      case 'tax_free':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Asset Header */}
      <div className="h-32 bg-gradient-to-br from-emerald-50 to-teal-100 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl">{getAssetIcon(asset.type)}</span>
        </div>

        {/* Asset Type Badge */}
        <Badge className="absolute top-3 left-3 bg-white text-gray-700">
          {getAssetLabel(asset.type)}
        </Badge>

        {/* Tax Environment Badge */}
        {asset.tax_environment !== 'taxable' && (
          <Badge className={`absolute top-3 right-12 ${getTaxBadgeColor(asset.tax_environment)}`}>
            {asset.tax_environment === 'tax_deferred' ? 'Tax Deferred' : 'Tax Free'}
          </Badge>
        )}

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-4">
        {/* Asset Name */}
        <h3 className="font-semibold text-gray-900 truncate mb-1">{asset.name}</h3>
        {asset.institution && (
          <p className="text-sm text-gray-500 mb-3 truncate">{asset.institution}</p>
        )}

        {/* Current Value */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(asset.current_value)}
          </p>
          {asset.purchase_value > 0 && gain !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <ArrowUpRight className={`w-3 h-3 ${gain < 0 ? 'rotate-90' : ''}`} />
              <span>{gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPercent}%)</span>
            </div>
          )}
        </div>

        {/* Financials Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div>
            <p className="text-xs text-gray-500">Expected Return</p>
            <p className="font-semibold text-gray-900 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {asset.expected_return}% p.a.
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Owner</p>
            <p className="font-semibold text-gray-900 capitalize">
              {asset.owner === 'you' ? 'You' : asset.owner === 'partner' ? 'Partner' : 'Joint'}
            </p>
          </div>
          {asset.contributions?.amount > 0 && (
            <>
              <div>
                <p className="text-xs text-gray-500">Contribution</p>
                <p className="font-semibold text-gray-900">
                  ${asset.contributions.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Frequency</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {asset.contributions.frequency}
                </p>
              </div>
            </>
          )}
          {asset.ticker && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Ticker / Units</p>
              <p className="font-semibold text-gray-900">
                {asset.ticker} • {asset.units} units
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetCard;
