import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Target, CheckCircle, Clock, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the progress chart
const progressData = [
  { name: 'Week 1', completed: 20 },
  { name: 'Week 2', completed: 35 },
  { name: 'Week 3', completed: 50 },
  { name: 'Week 4', completed: 70 },
];

// Mock data for upcoming deadlines
const upcomingDeadlines = [
  { id: 1, task: 'Submit Q2 OKR Review', dueDate: 'May 15, 2025' },
  { id: 2, task: 'Complete 360 Feedback', dueDate: 'May 18, 2025' },
  { id: 3, task: 'Team Project Update', dueDate: 'May 20, 2025' },
];

export const EmployeeDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter p-6">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">My OKRs</CardTitle>
              <Target className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <p className="text-xs text-gray-700">Active objectives</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">70%</div>
              <p className="text-xs text-gray-700">Of monthly goal</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">5</div>
              <p className="text-xs text-gray-700">Tasks in progress</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Achievements</CardTitle>
              <Award className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">2</div>
              <p className="text-xs text-gray-700">This month</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 bg-white border border-gray-200 rounded-lg shadow-md animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">My Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-3 bg-white border border-gray-200 rounded-lg shadow-md animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map(deadline => (
                  <div key={deadline.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">{deadline.task}</p>
                      <p className="text-xs text-gray-700">{deadline.dueDate}</p>
                    </div>
                    <span className="text-xs text-accent font-medium">Due Soon</span>
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

export default EmployeeDashboard;