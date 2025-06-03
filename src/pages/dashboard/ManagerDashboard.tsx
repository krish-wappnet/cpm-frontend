import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the team performance chart
const performanceData = [
  { name: 'Jan', performance: 60 },
  { name: 'Feb', performance: 65 },
  { name: 'Mar', performance: 70 },
  { name: 'Apr', performance: 68 },
  { name: 'May', performance: 75 },
];

// Mock data for team updates
const teamUpdates = [
  { id: 1, user: 'Sarah Lee', action: 'Completed Q2 OKR', time: '2 hours ago' },
  { id: 2, user: 'Mark Evans', action: 'Submitted project update', time: '5 hours ago' },
  { id: 3, user: 'Emily Brown', action: 'Requested approval for leave', time: '1 day ago' },
];

export const ManagerDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter p-6">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Team Members</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">15</div>
              <p className="text-xs text-gray-700">+2 from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Team OKRs</CardTitle>
              <Target className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">4</div>
              <p className="text-xs text-gray-700">Active objectives</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">85%</div>
              <p className="text-xs text-gray-700">+10% from last week</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <p className="text-xs text-gray-700">Requests waiting</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 bg-white border border-gray-200 rounded-lg shadow-md animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Area type="monotone" dataKey="performance" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-3 bg-white border border-gray-200 rounded-lg shadow-md animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Team Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamUpdates.map(update => (
                  <div key={update.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{update.user}</span> {update.action}
                      </p>
                      <p className="text-xs text-gray-700">{update.time}</p>
                    </div>
                    <span className="text-xs text-accent font-medium">Recent</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;