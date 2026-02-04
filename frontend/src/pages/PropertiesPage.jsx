import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFormModal from '../components/properties/PropertyFormModal';
import PropertyDetailsModal from '../components/properties/PropertyDetailsModal';
import {
  Plus,
  Search,
  Home,
  Building,
  TrendingUp,
  DollarSign,
  Filter,
} from 'lucide-react';

const PropertiesPage = () => {
  const { currentPortfolio, refreshSummary } = usePortfolio();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const fetchProperties = useCallback(async () => {
    if (!currentPortfolio?.id) return;

    try {
      setLoading(true);
      const data = await api.getProperties(currentPortfolio.id);
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPortfolio?.id]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setEditMode(true);
    setIsFormOpen(true);
    setIsDetailsOpen(false);
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      await api.deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      refreshSummary();
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  const handleFormSubmit = async (propertyData) => {
    try {
      if (editMode && selectedProperty) {
        const updated = await api.updateProperty(selectedProperty.id, propertyData);
        setProperties(prev => prev.map(p => p.id === selectedProperty.id ? updated : p));
      } else {
        const newProperty = await api.createProperty({
          ...propertyData,
          portfolio_id: currentPortfolio.id,
        });
        setProperties(prev => [...prev, newProperty]);
      }
      setIsFormOpen(false);
      refreshSummary();
    } catch (error) {
      console.error('Failed to save property:', error);
    }
  };

  // Calculate portfolio totals
  // Calculate portfolio totals
  const totals = properties.reduce((acc, prop) => ({
    totalValue: acc.totalValue + Number(prop.current_value || 0),
    totalDebt: acc.totalDebt + Number(prop.loan_details?.amount || 0),
    totalEquity: acc.totalEquity + (Number(prop.current_value || 0) - Number(prop.loan_details?.amount || 0)),
    annualRental: acc.annualRental + (Number(prop.rental_details?.income || 0) * (prop.rental_details?.frequency === 'weekly' ? 52 : prop.rental_details?.frequency === 'fortnightly' ? 26 : 12)),
  }), { totalValue: 0, totalDebt: 0, totalEquity: 0, annualRental: 0 });

  const filteredProperties = properties.filter(prop =>
    prop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prop.suburb?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentPortfolio) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Please create a portfolio first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500">Manage your property portfolio</p>
        </div>
        <Button
          onClick={handleAddProperty}
          className="bg-lime-400 text-gray-900 hover:bg-lime-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totals.totalValue / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Equity</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(totals.totalEquity / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-lime-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Annual Rental</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totals.annualRental.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by address or suburb..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No properties found' : 'No properties yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Add your first property to start tracking your portfolio'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleAddProperty}
                className="bg-lime-400 text-gray-900 hover:bg-lime-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={() => handleViewProperty(property)}
              onEdit={() => handleEditProperty(property)}
              onDelete={() => handleDeleteProperty(property.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <PropertyFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        property={selectedProperty}
        editMode={editMode}
      />

      <PropertyDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        property={selectedProperty}
        onEdit={() => handleEditProperty(selectedProperty)}
      />
    </div>
  );
};

export default PropertiesPage;
