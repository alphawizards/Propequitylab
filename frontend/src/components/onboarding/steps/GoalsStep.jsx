import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Slider } from '../../ui/slider';
import { Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const GoalsStep = ({ data, updateData, onNext, isLoading }) => {
  const currentYear = new Date().getFullYear();
  const birthYear = data.date_of_birth ? new Date(data.date_of_birth).getFullYear() : 1990;
  const currentAge = currentYear - birthYear;
  const retirementYear = currentYear + (data.retirement_age - currentAge);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Set Your Goals</h1>
        <p className="text-muted-foreground">Define your financial independence targets.</p>
      </div>
      
      {/* Retirement Age */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Target Retirement Age
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-foreground">{data.retirement_age}</p>
                <p className="text-sm text-muted-foreground">years old</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-primary">{retirementYear}</p>
                <p className="text-sm text-muted-foreground">{data.retirement_age - currentAge} years away</p>
              </div>
            </div>
            
            <Slider
              value={[data.retirement_age]}
              onValueChange={(value) => updateData({ retirement_age: value[0] })}
              min={40}
              max={75}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>40</span>
              <span>50</span>
              <span>60</span>
              <span>70</span>
              <span>75</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Equity Target */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Target Net Worth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              What net worth do you want to achieve by retirement?
            </p>
            
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="number"
                value={data.target_equity}
                onChange={(e) => updateData({ target_equity: parseFloat(e.target.value) || 0 })}
                className="pl-10 text-2xl font-bold h-14"
                placeholder="5000000"
              />
            </div>
            
            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              {[1000000, 2000000, 4000000, 5000000, 10000000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => updateData({ target_equity: amount })}
                  className={`${
                    data.target_equity === amount
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  ${(amount / 1000000).toFixed(0)}M
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Passive Income Target */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Target Passive Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              How much annual passive income do you want in retirement?
            </p>
            
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="number"
                value={data.target_passive_income}
                onChange={(e) => updateData({ target_passive_income: parseFloat(e.target.value) || 0 })}
                className="pl-10 text-2xl font-bold h-14"
                placeholder="150000"
              />
            </div>
            
            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              {[80000, 100000, 150000, 200000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => updateData({ target_passive_income: amount })}
                  className={`${
                    data.target_passive_income === amount
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  ${(amount / 1000).toFixed(0)}K/year
                </Button>
              ))}
            </div>
            
            {/* Calculated monthly */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                That's <span className="font-semibold text-foreground">
                  ${Math.round(data.target_passive_income / 12).toLocaleString()}
                </span> per month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Card */}
      <Card className="mb-8 bg-gradient-to-br from-foreground/90 to-foreground/80 text-background border-0">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary mb-4">Your FIRE Goal Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{data.retirement_age}</p>
              <p className="text-sm text-muted-foreground">Retirement Age</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${(data.target_equity / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-muted-foreground">Target Net Worth</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${(data.target_passive_income / 1000).toFixed(0)}K</p>
              <p className="text-sm text-muted-foreground">Annual Income</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          className="bg-primary text-white hover:bg-primary/90 px-8"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default GoalsStep;
