import { useClientelingContext, useOmneoClient } from '~/contexts/auth/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { MapPin, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Aggregations, Transaction } from '@omneo/omneo-sdk';

export default function Clienteling() {
  // Since we're inside AuthGuard, we know we're authenticated
  // No need to check isAuthenticated or handle loading/error states
  const { profile, location } = useClientelingContext();
  const client = useOmneoClient();
  const [aggregations, setAggregations] = useState<Aggregations>()

  useEffect(() => {
    if (!profile?.id) return;
    
    client.profiles.aggregations.list(profile.id).then((aggregations) => {
      setAggregations(aggregations)
    });
  }, [client, profile?.id]);

  // Helper function to format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!aggregations) {
    return (
      <div className="w-full p-6 flex justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading customer aggregations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Customer Insights</h1>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Total Spend */}
        <Card className="py-4 flex justify-center">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium">All Time Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(aggregations.spend_all)}</div>
            <p className="text-xs text-muted-foreground">
              Last 12 months: {formatCurrency(aggregations.spend_12m)}
            </p>
          </CardContent>
        </Card>

        {/* Average Transaction Value */}
        <Card className="py-4 flex justify-center">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium">Average Transaction Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(aggregations.spend_atv_all)}</div>
            <p className="text-xs text-muted-foreground">
              Last 12 months: {formatCurrency(aggregations.spend_atv_12m)}
            </p>
          </CardContent>
        </Card>

        {/* Shop Count */}
        <Card className="py-4 flex justify-center">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium">Total Transactions</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregations.shop_count}</div>
            <p className="text-xs text-muted-foreground">
              {aggregations.shop_days} shopping days
            </p>
          </CardContent>
        </Card>

        <div className="w-full col-span-3 flex flex-col gap-2">
          {/* Preferred Location */}
          {profile?.preferred_location && (
            <Card className="gap-0 p-3 w-full flex justify-center">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium">Preferred Location</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{profile.preferred_location.name || 'Unknown Store'}</div>
                <p className="text-xs text-muted-foreground">
                  Customer's preferred store
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
