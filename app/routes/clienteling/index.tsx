import { useClientelingContext, useOmneoClient } from '~/contexts/auth/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { MapPin, Calendar, DollarSign, ShoppingCart, AlertCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Transaction } from '@omneo/omneo-sdk';

export default function Clienteling() {
  const { location } = useClientelingContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const client = useOmneoClient();

  useEffect(() => {
    if (!location?.id) return;
    
    setLoading(true);
    client.transactions.list({ 
      'filter[location_id]': location.id, 
      'page[size]': '20', 
      'sort': '-transacted_at' 
    }).then(({ data }) => {
      setTransactions(data);
    }).catch((error) => {
      console.error('Failed to fetch transactions:', error);
    }).finally(() => {
      setLoading(false);
    });
  }, [location?.id]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Assuming amount is in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBackClick = () => {
    window.parent.postMessage({
      type: 'NAVIGATE',
      path: '/search'
    }, '*');
  };

  return (
    <div className="w-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border rounded-md hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Clienteling Dashboard</h1>
          <p className="text-muted-foreground">
            Current location transactions and details
          </p>
        </div>

        {/* Current Location Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {location ? (
              <div className="space-y-2">
                <p className="text-2xl font-semibold">{location.name}</p>
                <p className="text-muted-foreground">Location ID: {location.id}</p>
                {location.address && (
                    <div className="text-sm text-muted-foreground space-y-1">
                    <p>{location?.address?.address_line_1}</p>
                    {location?.address?.address_line_2 && <p>{location?.address?.address_line_2}</p>}
                    <p>{location?.address?.city}, {location?.address?.postcode}</p>
                    </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p>No location available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              {location ? `Transactions for ${location.name}` : 'No location selected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found for this location</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-3 border-l-4 border-l-blue-500 bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">
                            #{transaction.external_id || transaction.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.transacted_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {transaction.items && (
                          <div className="text-xs text-muted-foreground">
                            {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {formatCurrency(transaction.total, transaction.currency || 'USD')}
                        </span>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
