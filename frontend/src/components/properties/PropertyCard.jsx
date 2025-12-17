import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Car,
  TrendingUp,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const PropertyCard = ({ property, onView, onEdit, onDelete }) => {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Property Image Placeholder */}
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl">{getPropertyTypeIcon(property.property_type)}</span>
        </div>
        
        {/* Property Type Badge */}
        <Badge className="absolute top-3 left-3 bg-white text-gray-700 capitalize">
          {property.property_type}
        </Badge>
        
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
        {/* Address */}
        <h3 className="font-semibold text-gray-900 truncate">{property.address}</h3>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{property.suburb}, {property.state} {property.postcode}</span>
        </div>
        
        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            <span>{property.car_spaces}</span>
          </div>
        </div>
        
        {/* Financials */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div>
            <p className="text-xs text-gray-500">Value</p>
            <p className="font-semibold text-gray-900">
              ${(property.current_value / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Equity</p>
            <p className="font-semibold text-green-600">
              ${(equity / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">LVR</p>
            <p className={`font-semibold ${ltv > 80 ? 'text-red-500' : 'text-gray-900'}`}>
              {ltv}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Yield</p>
            <p className="font-semibold text-gray-900 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {grossYield}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
