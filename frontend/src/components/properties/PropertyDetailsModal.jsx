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
import { Separator } from '../ui/separator';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  Building,
  Key,
  Receipt,
  Pencil,
} from 'lucide-react';


const PropertyDetailsModal = ({ isOpen, onClose, property, onEdit }) => {
  if (!property) return null;

  const equity = (property.current_value || 0) - (property.loan_details?.amount || 0);
  const ltv = property.current_value > 0
    ? ((property.loan_details?.amount || 0) / property.current_value * 100).toFixed(1)
    : 0;

  const annualRental = (property.rental_details?.income || 0) *
    (property.rental_details?.frequency === 'weekly' ? 52 :
      property.rental_details?.frequency === 'fortnightly' ? 26 : 12);

  const grossYield = property.current_value > 0
    ? (annualRental / property.current_value * 100).toFixed(2)
    : 0;

  const totalExpenses = Object.values(property.expenses || {}).reduce((sum, val) => sum + (val || 0), 0);
  const netRental = annualRental - totalExpenses;
  const netYield = property.current_value > 0
    ? (netRental / property.current_value * 100).toFixed(2)
    : 0;

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'apartment':
      case 'unit':
        return '🏢';
      case 'townhouse':
        return '🏘️';
      case 'villa':
        return '🏡';
      default:
        return '🏠';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getPropertyTypeIcon(property.property_type)}</span>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {property.address}
                </DialogTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{property.suburb}, {property.state} {property.postcode}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 my-6">
          <Card className="bg-ocean/10 border-ocean/20">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="text-lg font-bold text-ocean">{formatCurrency(property.current_value)}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Equity</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(equity)}</p>
            </CardContent>
          </Card>
          <Card className={`${ltv > 80 ? 'bg-destructive/10 border-destructive/20' : 'bg-muted border-border'}`}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">LVR</p>
              <p className={`text-lg font-bold ${ltv > 80 ? 'text-destructive' : 'text-foreground'}`}>{ltv}%</p>
            </CardContent>
          </Card>
          <Card className="bg-plum/10 border-plum/20">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Net Yield</p>
              <p className="text-lg font-bold text-plum">{netYield}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Property Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant="outline" className="capitalize">{property.property_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bedrooms</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Bed className="w-4 h-4" /> {property.bedrooms}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bathrooms</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Bath className="w-4 h-4" /> {property.bathrooms}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Car Spaces</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Car className="w-4 h-4" /> {property.car_spaces}
                </span>
              </div>
              {property.land_size > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Land Size</span>
                  <span className="text-sm font-medium">{property.land_size} m²</span>
                </div>
              )}
              {property.year_built && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Year Built</span>
                  <span className="text-sm font-medium">{property.year_built}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Purchase Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Purchase Price</span>
                <span className="text-sm font-medium">{formatCurrency(property.purchase_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Purchase Date</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {property.purchase_date ? new Date(property.purchase_date).toLocaleDateString('en-AU') : '-'}
                </span>
              </div>
              {property.stamp_duty > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stamp Duty</span>
                  <span className="text-sm font-medium">{formatCurrency(property.stamp_duty)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Capital Growth</span>
                <span className={`text-sm font-medium ${property.current_value > property.purchase_price ? 'text-primary' : 'text-destructive'}`}>
                  {property.purchase_price > 0
                    ? ((property.current_value - property.purchase_price) / property.purchase_price * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-muted-foreground" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Loan Amount</span>
                <span className="text-sm font-medium">{formatCurrency(property.loan_details?.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Interest Rate</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  {property.loan_details?.interest_rate || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Loan Type</span>
                <Badge variant="outline" className="capitalize">
                  {property.loan_details?.loan_type?.replace('_', ' ')}
                </Badge>
              </div>
              {property.loan_details?.lender && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lender</span>
                  <span className="text-sm font-medium">{property.loan_details.lender}</span>
                </div>
              )}
              {property.loan_details?.offset_balance > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Offset Balance</span>
                  <span className="text-sm font-medium text-primary">
                    {formatCurrency(property.loan_details.offset_balance)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rental Income */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-muted-foreground" />
                Rental Income
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={property.rental_details?.is_rented ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>
                  {property.rental_details?.is_rented ? 'Tenanted' : 'Vacant'}
                </Badge>
              </div>
              {property.rental_details?.is_rented && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rent</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(property.rental_details?.income)}/{property.rental_details?.frequency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Annual Rental</span>
                    <span className="text-sm font-medium text-primary">{formatCurrency(annualRental)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gross Yield</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      {grossYield}%
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Annual Expenses */}
        {property.rental_details?.is_rented && totalExpenses > 0 && (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Annual Expenses Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Strata', value: property.expenses?.strata },
                  { label: 'Council Rates', value: property.expenses?.council_rates },
                  { label: 'Water Rates', value: property.expenses?.water_rates },
                  { label: 'Insurance', value: property.expenses?.insurance },
                  { label: 'Maintenance', value: property.expenses?.maintenance },
                  { label: 'Management', value: property.expenses?.property_management },
                  { label: 'Land Tax', value: property.expenses?.land_tax },
                ].filter(exp => exp.value > 0).map((expense) => (
                  <div key={expense.label} className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">{expense.label}</p>
                    <p className="text-sm font-medium">{formatCurrency(expense.value)}</p>
                  </div>
                ))}
                <div className="text-center p-2 bg-destructive/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Growth Assumptions */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Growth Assumptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-8">
              <div>
                <p className="text-sm text-muted-foreground">Capital Growth</p>
                <p className="text-lg font-semibold text-primary">
                  {property.growth_assumptions?.capital_growth_rate || 5}% p.a.
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rental Growth</p>
                <p className="text-lg font-semibold text-primary">
                  {property.growth_assumptions?.rental_growth_rate || 3}% p.a.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Close Button */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsModal;
