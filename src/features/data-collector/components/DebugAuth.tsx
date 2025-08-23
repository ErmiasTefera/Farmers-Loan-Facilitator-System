import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/core/store/authStore';
import { dataCollectorAPI } from '../data-collector.api';
import { supabase } from '@/core/api/supabase-client';

const DebugAuth: React.FC = () => {
  const { user } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // 1. Check current user
      info.currentUser = user;
      console.log('Current user:', user);

      // 2. Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      info.session = session;
      info.sessionError = sessionError;
      console.log('Session:', session);
      console.log('Session error:', sessionError);

      // 3. Check if user exists in auth.users
      if (user?.id) {
        const { data: authUser, error: authError } = await supabase
          .from('auth.users')
          .select('*')
          .eq('id', user.id)
          .single();
        info.authUser = authUser;
        info.authError = authError;
        console.log('Auth user:', authUser);
        console.log('Auth error:', authError);
      }

      // 4. Check data collector profile
      if (user?.id) {
        try {
          const profile = await dataCollectorAPI.getDataCollectorProfile(user.id);
          info.dataCollectorProfile = profile;
          console.log('Data collector profile:', profile);
        } catch (error) {
          info.dataCollectorError = error;
          console.log('Data collector error:', error);
        }
      }

      // 5. Test direct farmers query
      if (user?.id) {
        const { data: farmers, error: farmersError } = await supabase
          .from('farmers')
          .select('*')
          .limit(1);
        info.farmersTest = farmers;
        info.farmersError = farmersError;
        console.log('Farmers test:', farmers);
        console.log('Farmers error:', farmersError);
      }

    } catch (error) {
      info.generalError = error;
      console.log('General error:', error);
    }

    setDebugInfo(info);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Authentication & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runDebug} disabled={loading}>
            {loading ? 'Running Debug...' : 'Run Debug'}
          </Button>
          
          {debugInfo && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold">Current User:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.currentUser, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold">Session:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.session, null, 2)}
                </pre>
              </div>

              {debugInfo.sessionError && (
                <div>
                  <h3 className="font-semibold text-red-600">Session Error:</h3>
                  <pre className="bg-red-50 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo.sessionError, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h3 className="font-semibold">Auth User:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.authUser, null, 2)}
                </pre>
              </div>

              {debugInfo.authError && (
                <div>
                  <h3 className="font-semibold text-red-600">Auth Error:</h3>
                  <pre className="bg-red-50 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo.authError, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h3 className="font-semibold">Data Collector Profile:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.dataCollectorProfile, null, 2)}
                </pre>
              </div>

              {debugInfo.dataCollectorError && (
                <div>
                  <h3 className="font-semibold text-red-600">Data Collector Error:</h3>
                  <pre className="bg-red-50 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo.dataCollectorError, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h3 className="font-semibold">Farmers Test:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.farmersTest, null, 2)}
                </pre>
              </div>

              {debugInfo.farmersError && (
                <div>
                  <h3 className="font-semibold text-red-600">Farmers Error:</h3>
                  <pre className="bg-red-50 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo.farmersError, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.generalError && (
                <div>
                  <h3 className="font-semibold text-red-600">General Error:</h3>
                  <pre className="bg-red-50 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo.generalError, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAuth;
