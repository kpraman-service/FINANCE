'use client';

import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Download, FileText } from 'lucide-react';
import { api } from '../../../services/api';

interface ReportSummary {
  total_income: number;
  total_expenses: number;
  total_savings: number;
}

interface ReportData {
  report_period: string;
  summary?: ReportSummary;
}

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/monthly?month=${month}&year=${year}&format=json`);
      setReportData(res.data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.open(`${apiUrl}/api/reports/monthly?month=${month}&year=${year}&format=csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Financial Reports & Exports</h1>
        <p className="text-xs text-slate-400 mt-1">Generate comprehensive monthly statements and download raw CSV data</p>
      </div>

      <Card title="Report Configuration">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-44">
            <label className="block text-xs font-medium text-slate-300 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  Month {m}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-44">
            <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={fetchReport} isLoading={loading} className="gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Generate Summary</span>
            </Button>
            <Button onClick={handleExportCSV} variant="secondary" className="gap-1.5 border-blue-500/30 text-blue-400">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </Card>

      {reportData && (
        <Card title={`Financial Statement Summary (${reportData.report_period})`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Total Income</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                ₹{(reportData.summary?.total_income || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Total Expenses</div>
              <div className="text-xl font-bold text-red-400 mt-1">
                ₹{(reportData.summary?.total_expenses || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Net Surplus</div>
              <div className="text-xl font-bold text-blue-400 mt-1">
                ₹{(reportData.summary?.total_savings || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
