/**
 * ScenarioListPanel - Displays and manages scenario portfolios
 * 
 * Pro feature: Users can create up to 3 scenarios from their actual portfolio
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Edit, BarChart3, Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import api from '../../services/api';

const MAX_SCENARIOS = 3;

export default function ScenarioListPanel({
    portfolioId,
    userTier = 'free',
    onSelectScenario,
    onCompareScenario,
}) {
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newScenarioName, setNewScenarioName] = useState('');
    const [creating, setCreating] = useState(false);

    const isPro = userTier === 'pro' || userTier === 'enterprise';
    const canCreate = isPro && scenarios.length < MAX_SCENARIOS;

    // Fetch scenarios on mount
    useEffect(() => {
        if (portfolioId) {
            fetchScenarios();
        }
    }, [portfolioId]);

    const fetchScenarios = async () => {
        try {
            setLoading(true);
            const data = await api.listScenarios(portfolioId);
            setScenarios(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch scenarios:', err);
            setError('Failed to load scenarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateScenario = async () => {
        if (!newScenarioName.trim()) return;

        try {
            setCreating(true);
            const newScenario = await api.createScenario(portfolioId, newScenarioName.trim());
            setScenarios([...scenarios, newScenario]);
            setNewScenarioName('');
            setShowCreateModal(false);
        } catch (err) {
            console.error('Failed to create scenario:', err);
            if (err.response?.status === 403) {
                setError('Upgrade to Pro to create scenarios');
            } else if (err.response?.status === 400) {
                setError(`Maximum ${MAX_SCENARIOS} scenarios allowed`);
            } else {
                setError('Failed to create scenario');
            }
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteScenario = async (scenarioId) => {
        if (!window.confirm('Delete this scenario? This cannot be undone.')) return;

        try {
            await api.deleteScenario(scenarioId);
            setScenarios(scenarios.filter(s => s.id !== scenarioId));
        } catch (err) {
            console.error('Failed to delete scenario:', err);
            setError('Failed to delete scenario');
        }
    };

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value.toFixed(0)}`;
    };

    // Free tier notice
    if (!isPro) {
        return (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="h-5 w-5 text-purple-600" />
                        Scenario Planning
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                        Create "what-if" scenarios to compare different investment strategies.
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Upgrade to Pro
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                        Scenarios
                    </CardTitle>
                    <span className="text-xs text-gray-500">
                        {scenarios.length}/{MAX_SCENARIOS}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="bg-red-50 text-red-700 text-sm p-2 rounded mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                ) : (
                    <div className="space-y-2">
                        {scenarios.map((scenario) => (
                            <div
                                key={scenario.id}
                                className="border rounded-lg p-3 hover:border-emerald-300 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-medium text-sm">{scenario.scenario_name || 'Scenario'}</h4>
                                        <p className="text-xs text-gray-500">
                                            Created {new Date(scenario.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => onSelectScenario?.(scenario)}
                                            title="View Dashboard"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                            onClick={() => handleDeleteScenario(scenario.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick metrics */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-500">Value:</span>{' '}
                                        <span className="font-medium">
                                            {formatCurrency(parseFloat(scenario.total_property_value) + parseFloat(scenario.total_assets))}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Equity:</span>{' '}
                                        <span className="font-medium text-emerald-600">
                                            {formatCurrency(parseFloat(scenario.total_equity))}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 text-xs"
                                    onClick={() => onCompareScenario?.(scenario)}
                                >
                                    Compare to Actual
                                </Button>
                            </div>
                        ))}

                        {scenarios.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No scenarios yet. Create one to explore "what-if" situations.
                            </p>
                        )}
                    </div>
                )}

                {/* Create button or modal */}
                {showCreateModal ? (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <Label className="text-sm">Scenario Name</Label>
                        <Input
                            value={newScenarioName}
                            onChange={(e) => setNewScenarioName(e.target.value)}
                            placeholder="e.g. Early Retirement"
                            className="mt-1 mb-2"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleCreateScenario}
                                disabled={creating || !newScenarioName.trim()}
                            >
                                {creating ? 'Creating...' : 'Create'}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        className="w-full mt-3"
                        variant={canCreate ? 'default' : 'outline'}
                        disabled={!canCreate}
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        {canCreate ? 'Create Scenario' : `Limit Reached (${MAX_SCENARIOS})`}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
