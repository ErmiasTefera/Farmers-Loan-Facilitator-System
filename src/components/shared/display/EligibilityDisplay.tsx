import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';

export interface EligibilityResult {
  eligible: boolean;
  creditScore: number;
  maxLoanAmount: number;
  recommendedAmount: number;
  interestRate: number;
  reasons: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface EligibilityDisplayProps {
  result: EligibilityResult;
  onApplyLoan?: () => void;
  onCheckAgain?: () => void;
  className?: string;
}

export const EligibilityDisplay: React.FC<EligibilityDisplayProps> = ({ 
  result,
  onApplyLoan,
  onCheckAgain,
  className = ""
}) => {
  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600';
    if (score >= 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Result Header */}
      <Card className={`border-2 ${result.eligible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {result.eligible ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <h2 className={`text-2xl font-bold ${result.eligible ? 'text-green-800' : 'text-red-800'}`}>
                  {result.eligible ? 'You\'re Eligible!' : 'Not Eligible Yet'}
                </h2>
                <p className={`${result.eligible ? 'text-green-700' : 'text-red-700'}`}>
                  {result.eligible 
                    ? 'Congratulations! You qualify for a loan.'
                    : 'Don\'t worry, you can improve your eligibility.'}
                </p>
              </div>
            </div>
            {getRiskBadge(result.riskLevel)}
          </div>

          {result.eligible && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ETB {result.maxLoanAmount.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Maximum Loan Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ETB {result.recommendedAmount.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Recommended Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result.interestRate}%
                </div>
                <div className="text-sm text-purple-700">Annual Interest Rate</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Score and Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Credit Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${getScoreColor(result.creditScore)}`}>
                {result.creditScore}
              </div>
              <div className="text-sm text-gray-600">
                {result.creditScore >= 700 ? 'Excellent' : 
                 result.creditScore >= 500 ? 'Good' : 'Fair'} Credit Rating
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    result.creditScore >= 700 ? 'bg-green-600' :
                    result.creditScore >= 500 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(100, (result.creditScore / 850) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Score range: 300-850
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span>Assessment Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.reasons.map((reason, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{reason}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Recommendations for Improvement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-orange-800">{index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {result.eligible && onApplyLoan && (
          <button
            onClick={onApplyLoan}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Apply for Loan Now
          </button>
        )}
        {onCheckAgain && (
          <button
            onClick={onCheckAgain}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Check Again
          </button>
        )}
      </div>
    </div>
  );
};
