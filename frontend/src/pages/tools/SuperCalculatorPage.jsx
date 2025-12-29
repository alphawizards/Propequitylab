
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calculator } from 'lucide-react';

const SuperCalculatorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_balance: 100000,
    income_gross: 120000,
    employer_contribution_rate: 11.5,
    personal_contribution_rate: 0,
    personal_contribution_amount: 0,
    expected_return: 7.0,
    years: 30,
    salary_growth_rate: 3.0,
    inflation_rate: 2.5
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateProjection = async () => {
    setLoading(true);
    try {
      // Direct call since we added the endpoint but might not have updated api.js service yet
      // Assuming api.js has a generic request or we add it to api.js
      // We'll update api.js in next step, but here's the logic
      const response = await api.calculateSuperProjection(formData);
      setResults(response);
    } catch (error) {
      console.error("Calculation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToPortfolio = async () => {
    try {
      await api.createAsset({
        portfolio_id: "current", // This needs to be handled by backend or context.
        // Ideally we grab portfolio ID from context.
        // For now, let's assume the user has selected a portfolio in context.
        // We'll fix this integration in the actual implementation block.
        name: "Superannuation Fund",
        type: "super",
        current_value: formData.current_balance,
        expected_return: formData.expected_return,
        contributions: {
          frequency: "monthly",
          contribution_type: "percentage",
          income_gross: formData.income_gross,
          employer_contribution_rate: formData.employer_contribution_rate,
          personal_contribution_rate: formData.personal_contribution_rate
        }
      });
      navigate('/assets');
    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Superannuation Projector</h1>
          <p className="text-gray-500">Forecast your retirement savings based on Australian rules</p>
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
              <Label>Current Balance ($)</Label>
              <Input
                type="number"
                value={formData.current_balance}
                onChange={(e) => handleChange('current_balance', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Annual Gross Income ($)</Label>
              <Input
                type="number"
                value={formData.income_gross}
                onChange={(e) => handleChange('income_gross', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Employer Contribution (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.employer_contribution_rate}
                onChange={(e) => handleChange('employer_contribution_rate', e.target.value)}
              />
              <p className="text-xs text-gray-500">Current SG rate is 11.5%</p>
            </div>

            <div className="space-y-2">
              <Label>Voluntary Contribution (% of Salary)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.personal_contribution_rate}
                onChange={(e) => handleChange('personal_contribution_rate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Annual Return (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.expected_return]}
                  min={1}
                  max={15}
                  step={0.5}
                  onValueChange={(vals) => handleChange('expected_return', vals[0])}
                  className="flex-1"
                />
                <span className="w-12 text-right font-medium">{formData.expected_return}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Projection Period (Years)</Label>
              <div className="flex gap-2">
                {[10, 20, 30, 40, 50].map(yr => (
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
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-lime-50 border-lime-200">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Projected Nominal Balance</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${results.final_balance_nominal.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">In future dollars</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Projected Real Balance</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${results.final_balance_real.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Adjusted for inflation (today's dollars)</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Projection Graph</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.projections} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                          formatter={(value) => [`$${value.toLocaleString()}`, "Balance"]}
                          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="balance_nominal"
                          name="Nominal Balance"
                          stroke="#84cc16"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="balance_real"
                          name="Real Balance (Inflation Adjusted)"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Save Action - requires context awareness of portfolio which we'll mock or require */}
              {/* <div className="flex justify-end">
                <Button onClick={saveToPortfolio} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save as Asset
                </Button>
              </div> */}
            </>
          ) : (
            <Card className="h-full flex items-center justify-center bg-gray-50 border-dashed">
              <CardContent className="text-center py-12">
                <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Ready to calculate</h3>
                <p className="text-gray-500">Enter your details and click calculate to see your superannuation projection.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperCalculatorPage;
