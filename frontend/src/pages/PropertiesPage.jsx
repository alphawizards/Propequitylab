import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFormModal from '../components/properties/PropertyFormModal';
import PropertyDetailsModal from '../components/properties/PropertyDetailsModal';
import KPICard from '../components/dashboard/KPICard';
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
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchProperties = useCallback(async () => {
    if (!currentPortfolio?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getProperties(currentPortfolio.id);
      setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError(err.response?.data?.detail || 'Failed to load properties. Please try again.');
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

  const handleDeleteProperty = (propertyId) => {
    setDeleteConfirmId(propertyId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteProperty(deleteConfirmId);
      setProperties(prev => prev.filter(p => p.id !== deleteConfirmId));
      refreshSummary();
    } catch (error) {
      console.error('Failed to delete property:', error);
    } finally {
      setDeleteConfirmId(null);
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
          <h1 className="text-2xl font-semibold text-[#111111] dark:text-white">Properties</h1>
          <p className="text-[#6B7280] dark:text-gray-400">Manage your property portfolio</p>
        </div>
        <Button
          onClick={handleAddProperty}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Properties"
          value={properties.length.toString()}
          icon={Building}
          variant="blue"
        />
        <KPICard
          title="Portfolio Value"
          value={`$${(totals.totalValue / 1000000).toFixed(2)}M`}
          icon={Home}
          variant="green"
        />
        <KPICard
          title="Total Equity"
          value={`$${(totals.totalEquity / 1000000).toFixed(2)}M`}
          icon={TrendingUp}
          variant="green"
        />
        <KPICard
          title="Annual Rental"
          value={`$${totals.annualRental.toLocaleString()}`}
          icon={DollarSign}
          variant="purple"
        />
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

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No properties found' : 'No properties yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Add your first property to start tracking your portfolio'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleAddProperty}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
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

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this property from your portfolio. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertiesPage;
