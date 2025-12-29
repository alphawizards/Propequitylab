
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';

const PropertyCalculatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_value: 850000,
    loan_balance: 600000,
    interest_rate: 6.25,
    loan_term_years: 30,
    capital_growth_rate: 5.0,
    repayment_type: "principal_interest",
    years: 30
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateProjection = async () => {
    setLoading(true);
    try {
      const response = await api.calculatePropertyProjection(formData);
      setResults(response);
    } catch (error) {
      console.error("Calculation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    // Handle string inputs that need to be floats/ints
    if (field === 'repayment_type') {
        setFormData(prev => ({ ...prev, [field]: value }));
    } else {
        setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Equity Projector</h1>
          <p className="text-gray-500">Forecast property value, debt reduction, and equity growth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-lime-600" />
              Assumptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Property Value ($)</Label>
              <Input
                type="number"
                value={formData.current_value}
                onChange={(e) => handleChange('current_value', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Loan Balance ($)</Label>
              <Input
                type="number"
                value={formData.loan_balance}
                onChange={(e) => handleChange('loan_balance', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Interest Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => handleChange('interest_rate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Capital Growth Rate (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.capital_growth_rate]}
                  min={0}
                  max={15}
                  step={0.5}
                  onValueChange={(vals) => handleChange('capital_growth_rate', vals[0])}
                  className="flex-1"
                />
                <span className="w-12 text-right font-medium">{formData.capital_growth_rate}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Loan Term (Years)</Label>
              <Input
                type="number"
                value={formData.loan_term_years}
                onChange={(e) => handleChange('loan_term_years', e.target.value)}
              />
            </div>

            <div className="space-y-2">
                <Label>Repayment Type</Label>
                <Select value={formData.repayment_type} onValueChange={(v) => handleChange('repayment_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principal_interest">Principal & Interest</SelectItem>
                    <SelectItem value="interest_only">Interest Only</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label>Projection Period (Years)</Label>
              <div className="flex gap-2">
                {[10, 20, 30].map(yr => (
                  <Button
                    key={yr}
                    variant={formData.years === yr ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange('years', yr)}
                    className={formData.years === yr ? "bg-lime-500 hover:bg-lime-600 text-white" : ""}
                  >
                    {yr}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={calculateProjection} className="w-full mt-4 bg-lime-500 hover:bg-lime-600 text-white" disabled={loading}>
              {loading ? "Calculating..." : "Calculate Projection"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {results ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-lime-50 border-lime-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Projected Equity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${results.final_equity.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Projected Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${results.final_value.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Remaining Debt</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${results.projections[results.projections.length-1].loan_balance.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Equity Growth Graph</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.projections} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                          dataKey="year"
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]}
                          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="property_value"
                          name="Property Value"
                          stroke="#84cc16"
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                        <Area
                          type="monotone"
                          dataKey="loan_balance"
                          name="Loan Balance"
                          stroke="#ef4444"
                          fillOpacity={1}
                          fill="url(#colorDebt)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center bg-gray-50 border-dashed">
              <CardContent className="text-center py-12">
                <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Ready to calculate</h3>
                <p className="text-gray-500">Enter your details and click calculate to see your property equity projection.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCalculatorPage;
