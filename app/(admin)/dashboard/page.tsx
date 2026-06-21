'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers } from '@/services/users.service';
import { getPlans } from '@/services/plans.service';
import { getRateLimits } from '@/services/rate-limits.service';
import { getUrlLimits } from '@/services/url-limits.service';
import { getBanks } from '@/services/bank.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, DollarSign, Zap, Link, Building2 } from 'lucide-react';

const MODULES = [
  { key: 'users', label: 'Utilisateurs', icon: Users, color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/15', href: '/users', fetch: () => getUsers(1, 1) },
  { key: 'plans', label: 'Plans tarifaires', icon: DollarSign, color: 'text-[#A8E6CF]', bg: 'bg-[#A8E6CF]/20', href: '/plans', fetch: () => getPlans(1, 1) },
  { key: 'rateLimits', label: 'Rate Limits', icon: Zap, color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/15', href: '/rate-limits', fetch: () => getRateLimits(1, 1) },
  { key: 'urlLimits', label: 'URL Limits', icon: Link, color: 'text-[#88D8B0]', bg: 'bg-[#88D8B0]/20', href: '/rate-limits', fetch: () => getUrlLimits(1, 1) },
  { key: 'banks', label: 'Banques', icon: Building2, color: 'text-[#4ECDC4]', bg: 'bg-[#4ECDC4]/10', href: '/banks', fetch: () => getBanks(1, 1) },
];

const BAR_DATA = {
  week: [
    { name: 'S1', utilisateurs: 120, plans: 60, banques: 5 },
    { name: 'S2', utilisateurs: 70, plans: 140, banques: 8 },
    { name: 'S3', utilisateurs: 100, plans: 85, banques: 3 },
    { name: 'S4', utilisateurs: 100, plans: 105, banques: 6 },
  ],
  month: [
    { name: 'Jan', utilisateurs: 20, plans: 40, banques: 2 },
    { name: 'Fev', utilisateurs: 35, plans: 70, banques: 4 },
    { name: 'Mar', utilisateurs: 55, plans: 45, banques: 3 },
    { name: 'Avr', utilisateurs: 90, plans: 60, banques: 5 },
    { name: 'Mai', utilisateurs: 130, plans: 80, banques: 7 },
    { name: 'Juin', utilisateurs: 100, plans: 70, banques: 6 },
    { name: 'Juil', utilisateurs: 110, plans: 75, banques: 4 },
    { name: 'Aout', utilisateurs: 80, plans: 50, banques: 3 },
    { name: 'Sep', utilisateurs: 95, plans: 65, banques: 5 },
    { name: 'Oct', utilisateurs: 120, plans: 80, banques: 8 },
    { name: 'Nov', utilisateurs: 90, plans: 150, banques: 6 },
    { name: 'Dec', utilisateurs: 100, plans: 180, banques: 9 },
  ],
};

const pieData = [
  { name: 'Premium', value: 35 },
  { name: 'Standard', value: 60 },
  { name: 'Free', value: 85 },
];

const PIE_COLORS = ['#fd9644', '#a55eea', '#20bf6b'];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm w-full overflow-hidden">
      <h2 className="text-lg font-bold text-gray-900 mb-6">{title}</h2>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(MODULES.map(m => m.fetch()));
      const newValues: Record<string, number> = {};

      MODULES.forEach((m, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        const resValue = result.value; 
        newValues[m.key] = resValue?.data?.pagination?.total ?? 0;
      } else {
        newValues[m.key] = 0;
      }
    });

      setValues(newValues);
    } catch (error) {
      console.error("Erreur lors du traitement des compteurs de statistiques", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {MODULES.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              onClick={() => router.push(m.href)}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-[#A78BFA]/30 transition-all text-left"
            >
              <div className={`p-3 rounded-xl ${m.bg} w-fit mb-3`}>
                <Icon className={`w-5 h-5 ${m.color}`} />
              </div>
              {loading ? (
                <div className="h-7 w-12 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{values[m.key] ?? 0}</p>
              )}
              <p className="text-sm text-gray-500">{m.label}</p>
            </button>
          );
        })}
      </div>

      <SectionCard title="Activité de la plateforme">
        <div className="flex flex-wrap gap-2 mb-4">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                period === p
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
              }`}
            >
              {p === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={100}>
            <BarChart data={BAR_DATA[period]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Bar dataKey="utilisateurs" fill="#00377D" radius={[6, 6, 0, 0]} name="Utilisateurs" />
              <Bar dataKey="plans" fill="#FFD100" radius={[6, 6, 0, 0]} name="Plans" />
              <Bar dataKey="banques" fill="#fd9644" radius={[6, 6, 0, 0]} name="Banques" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Répartition des plans">
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={100}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Actions rapides">
          <div className="space-y-2">
            {MODULES.map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => router.push(m.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`p-2 ${m.bg} rounded-lg`}>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{m.label}</span>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}