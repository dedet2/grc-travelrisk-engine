'use client';

import { useState, useMemo, useEffect } from 'react';

interface HealthProvider {
  id: string;
  name: string;
  specialty: string;
  nextAppointment: string | null;
  status: 'Active' | 'Inactive';
  type: 'Doctor' | 'Specialist' | 'In-Home Aid' | 'Therapist' | 'Lawyer';
}

interface HealthTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

interface HealthMetrics {
  activeProviders: number;
  upcomingAppointments: number;
  pendingTasks: number;
  monthlyCost: number;
}

const mockProvidersData: HealthProvider[] = [
  {
    id: '1',
    name: 'Dr. Sarah Smith',
    specialty: 'Primary Care',
    nextAppointment: '2024-03-15',
    status: 'Active',
    type: 'Doctor',
  },
  {
    id: '2',
    name: 'Dr. Marcus Johnson',
    specialty: 'Hematology (Sickle Cell)',
    nextAppointment: '2024-03-22',
    status: 'Active',
    type: 'Specialist',
  },
  {
    id: '3',
    name: 'Dr. Jennifer Lee',
    specialty: 'Pain Management',
    nextAppointment: '2024-04-10',
    status: 'Active',
    type: 'Specialist',
  },
  {
    id: '4',
    name: 'Maria Gonzalez',
    specialty: 'Physical Therapy',
    nextAppointment: '2024-03-18',
    status: 'Active',
    type: 'In-Home Aid',
  },
  {
    id: '5',
    name: 'Robert Davis, Esq.',
    specialty: 'Healthcare Attorney',
    nextAppointment: null,
    status: 'Active',
    type: 'Lawyer',
  },
];

const mockTasksData: HealthTask[] = [
  {
    id: '1',
    title: 'Schedule quarterly checkup with Dr. Smith',
    dueDate: '2024-03-01',
    priority: 'High',
    completed: false,
  },
  {
    id: '2',
    title: 'Refill pain management prescription',
    dueDate: '2024-03-05',
    priority: 'High',
    completed: false,
  },
  {
    id: '3',
    title: 'Complete blood work lab results review',
    dueDate: '2024-03-10',
    priority: 'Medium',
    completed: false,
  },
  {
    id: '4',
    title: 'Schedule PT session with Maria',
    dueDate: '2024-03-12',
    priority: 'Medium',
    completed: true,
  },
  {
    id: '5',
    title: 'Update healthcare directives with attorney',
    dueDate: '2024-03-20',
    priority: 'Low',
    completed: false,
  },
];

function getProviderType(specialty: string): 'Doctor' | 'Specialist' | 'In-Home Aid' | 'Therapist' | 'Lawyer' {
  const lowerSpecialty = specialty.toLowerCase();
  if (lowerSpecialty.includes('attorney') || lowerSpecialty.includes('lawyer')) {
    return 'Lawyer';
  }
  if (lowerSpecialty.includes('therapist') || lowerSpecialty.includes('therapy')) {
    return 'Therapist';
  }
  if (lowerSpecialty.includes('primary care') || lowerSpecialty.includes('general')) {
    return 'Doctor';
  }
  if (lowerSpecialty.includes('hematolog') || lowerSpecialty.includes('specialist') || lowerSpecialty.includes('pain management')) {
    return 'Specialist';
  }
  return 'In-Home Aid';
}

function getProviderTypeColor(type: string): string {
  switch (type) {
    case 'Doctor':
      return 'bg-blue-50 text-blue-700';
    case 'Specialist':
      return 'bg-purple-50 text-purple-700';
    case 'In-Home Aid':
      return 'bg-green-50 text-green-700';
    case 'Therapist':
      return 'bg-orange-50 text-orange-700';
    case 'Lawyer':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-violet-50/30 text-violet-700';
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'Medium':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'Low':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    default:
      return 'bg-violet-100 text-violet-700 border-violet-300';
  }
}

export default function HealthPage() {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [tasks, setTasks] = useState<HealthTask[]>(mockTasksData);
  const [providers, setProviders] = useState<HealthProvider[]>(mockProvidersData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const typeOptions = ['All', 'Doctor', 'Specialist', 'In-Home Aid', 'Therapist', 'Lawyer'];

  // Fetch providers from API on mount
  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      setHasError(false);
      setIsEmpty(false);
      try {
        const response = await fetch('/api/health/providers');
        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }
        const result = await response.json();

        if (result.data && Array.isArray(result.data)) {
          // Transform API response to match our interface
          const transformedProviders: HealthProvider[] = result.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            specialty: p.specialty,
            nextAppointment: p.nextAppointment || null,
            status: 'Active' as const,
            type: getProviderType(p.specialty),
          }));

          if (transformedProviders.length === 0) {
            setIsEmpty(true);
            setProviders(mockProvidersData);
          } else {
            setProviders(transformedProviders);
          }
        } else {
          setProviders(mockProvidersData);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        setHasError(true);
        // Fall back to mock data on error
        setProviders(mockProvidersData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const filteredProviders = useMemo(() => {
    if (selectedType === 'All') {
      return providers;
    }
    return providers.filter((p) => p.type === selectedType);
  }, [selectedType, providers]);

  const metrics: HealthMetrics = {
    activeProviders: providers.filter((p) => p.status === 'Active').length,
    upcomingAppointments: providers.filter((p) => p.nextAppointment).length,
    pendingTasks: tasks.filter((t) => !t.completed).length,
    monthlyCost: 2450,
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const incompleteTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-violet-950">Health & Caregiving</h1>
        <p className="text-violet-600 mt-2">
          Manage your health providers and care coordination
        </p>
        {isLoading && <p className="text-violet-500 text-sm mt-2">Loading providers...</p>}
        {hasError && <p className="text-cyan-500 text-sm mt-2">Note: Using fallback data. Check network connection.</p>}
        {isEmpty && <p className="text-fuchsia-500 text-sm mt-2">No providers found.</p>}
      </div>

      {/* Metric Cards - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Providers */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-violet-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Active Providers</p>
          <p className="text-4xl font-bold text-violet-600">{metrics.activeProviders}</p>
          <p className="text-xs text-violet-600 mt-2">Healthcare team</p>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Upcoming Appointments</p>
          <p className="text-4xl font-bold text-blue-600">{metrics.upcomingAppointments}</p>
          <p className="text-xs text-violet-600 mt-2">Scheduled</p>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Pending Tasks</p>
          <p className="text-4xl font-bold text-amber-600">{metrics.pendingTasks}</p>
          <p className="text-xs text-violet-600 mt-2">To complete</p>
        </div>

        {/* Monthly Care Cost */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Monthly Care Cost</p>
          <p className="text-4xl font-bold text-purple-600">
            ${metrics.monthlyCost.toLocaleString()}
          </p>
          <p className="text-xs text-violet-600 mt-2">Current expenses</p>
        </div>
      </div>

      {/* Health Tasks Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-violet-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-violet-950">Health Tasks</h2>
            <p className="text-sm text-violet-600 mt-1">
              {incompleteTasks.length} tasks pending
            </p>
          </div>
          <button className="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
            + Add Task
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {incompleteTasks.length > 0 ? (
              incompleteTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 border border-violet-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="w-5 h-5 text-violet-600 rounded border-violet-300 focus:ring-violet-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-violet-950">{task.title}</p>
                    <p className="text-sm text-violet-600 mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-violet-500 text-center py-8">All tasks completed!</p>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-violet-950 mb-4">Filter by Type</h2>
        <div className="flex flex-wrap gap-3">
          {typeOptions.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-violet-600 text-white'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-violet-200 p-6">
          <h2 className="text-xl font-bold text-violet-950">Healthcare Providers</h2>
          <p className="text-sm text-violet-600 mt-1">
            {filteredProviders.length} providers found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-violet-50/30 border-b border-violet-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Provider Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Specialty
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Next Appointment
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.length > 0 ? (
                filteredProviders.map((provider) => (
                  <tr
                    key={provider.id}
                    className="border-b border-violet-200 hover:bg-violet-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-violet-950">
                      {provider.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-violet-600">
                      {provider.specialty}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProviderTypeColor(provider.type)}`}>
                        {provider.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-violet-600">
                      {provider.nextAppointment
                        ? new Date(provider.nextAppointment).toLocaleDateString()
                        : 'No appointment scheduled'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${provider.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-violet-100 text-violet-700 border border-violet-300'}`}>
                        {provider.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-violet-500">
                    No providers found for this type
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Care Team Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-violet-950 mb-6">Care Team</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
            <p className="text-violet-500 mt-2">Loading care team...</p>
          </div>
        ) : isEmpty ? (
          <p className="text-violet-500 text-center py-8">No care team members available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="border border-violet-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-violet-950">{provider.name}</h3>
                    <p className="text-sm text-violet-600 mt-1">{provider.specialty}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProviderTypeColor(provider.type)}`}>
                    {provider.type}
                  </span>
                </div>
                {provider.nextAppointment && (
                  <p className="text-sm text-violet-600 font-medium mt-3">
                    Next: {new Date(provider.nextAppointment).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
