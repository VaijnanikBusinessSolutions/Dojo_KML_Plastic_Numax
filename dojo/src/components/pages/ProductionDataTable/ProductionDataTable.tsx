import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Download, Filter, Eye, TrendingUp, TrendingDown, Calendar, BarChart3, Users } from 'lucide-react';

// Type definitions
interface LineData {
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  total: number;
}

interface ProductionDataItem {
  month: string;
  year: number;
  ctq: LineData;
  pdi: LineData;
  other: LineData;
  grandTotal: number;
}

// Mock data structure matching your existing types
const mockProductionData: ProductionDataItem[] = [
  {
    month: 'January',
    year: 2024,
    ctq: { l1: 245, l2: 220, l3: 198, l4: 210, total: 873 },
    pdi: { l1: 180, l2: 195, l3: 175, l4: 165, total: 715 },
    other: { l1: 90, l2: 85, l3: 95, l4: 88, total: 358 },
    grandTotal: 1946
  },
  {
    month: 'February',
    year: 2024,
    ctq: { l1: 238, l2: 215, l3: 205, l4: 225, total: 883 },
    pdi: { l1: 185, l2: 200, l3: 180, l4: 170, total: 735 },
    other: { l1: 92, l2: 87, l3: 98, l4: 91, total: 368 },
    grandTotal: 1986
  },
  {
    month: 'March',
    year: 2024,
    ctq: { l1: 250, l2: 230, l3: 215, l4: 235, total: 930 },
    pdi: { l1: 190, l2: 205, l3: 185, l4: 175, total: 755 },
    other: { l1: 95, l2: 90, l3: 100, l4: 93, total: 378 },
    grandTotal: 2063
  },
  {
    month: 'April',
    year: 2024,
    ctq: { l1: 242, l2: 225, l3: 208, l4: 228, total: 903 },
    pdi: { l1: 188, l2: 202, l3: 182, l4: 172, total: 744 },
    other: { l1: 93, l2: 88, l3: 97, l4: 90, total: 368 },
    grandTotal: 2015
  },
  {
    month: 'May',
    year: 2024,
    ctq: { l1: 255, l2: 240, l3: 220, l4: 245, total: 960 },
    pdi: { l1: 195, l2: 210, l3: 190, l4: 180, total: 775 },
    other: { l1: 98, l2: 95, l3: 105, l4: 97, total: 395 },
    grandTotal: 2130
  },
  {
    month: 'June',
    year: 2024,
    ctq: { l1: 248, l2: 232, l3: 212, l4: 238, total: 930 },
    pdi: { l1: 192, l2: 207, l3: 187, l4: 177, total: 763 },
    other: { l1: 96, l2: 92, l3: 102, l4: 94, total: 384 },
    grandTotal: 2077
  }
];

const ProductionDataTable = () => {
  const [data, setData] = useState<ProductionDataItem[]>(mockProductionData);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    const sortedData = [...data].sort((a, b) => {
      let aValue: any = field === 'period' ? `${a.month} ${a.year}` : (a as any)[field];
      let bValue: any = field === 'period' ? `${b.month} ${b.year}` : (b as any)[field];
      
      if (field === 'grandTotal') {
        aValue = a.grandTotal;
        bValue = b.grandTotal;
      }
      
      if (newDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setData(sortedData);
  };

  const getEfficiencyStatus = (value: number, maxValue: number = 250) => {
    const efficiency = (value / maxValue) * 100;
    if (efficiency >= 90) return { status: 'excellent', color: 'text-gray-700 bg-gray-100 border-gray-300' };
    if (efficiency >= 80) return { status: 'good', color: 'text-gray-600 bg-gray-50 border-gray-200' };
    if (efficiency >= 70) return { status: 'average', color: 'text-gray-500 bg-gray-50 border-gray-200' };
    return { status: 'low', color: 'text-gray-500 bg-gray-100 border-gray-300' };
  };

  const getTrendIcon = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-gray-600 ml-2" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-gray-600 ml-2" />;
    return null;
  };

  const filteredData = data.filter(item =>
    item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.year.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Production Data Overview
              </h1>
              <p className="text-gray-600">Manufacturing performance analysis and reporting</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors duration-200">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Search and Stats Bar */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by month or year..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center space-x-8 ml-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{filteredData.length}</div>
                  <div className="text-sm text-gray-500">Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredData.reduce((sum, item) => sum + item.grandTotal, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Units</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(filteredData.reduce((sum, item) => sum + item.grandTotal, 0) / filteredData.length).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Average</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold text-sm">
                    <div className="flex items-center cursor-pointer hover:text-gray-200" onClick={() => handleSort('period')}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Period
                      {sortField === 'period' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-sm">CTQ Production</th>
                  <th className="px-6 py-4 text-center font-semibold text-sm">PDI Production</th>
                  <th className="px-6 py-4 text-center font-semibold text-sm">Other Production</th>
                  <th className="px-6 py-4 text-center font-semibold text-sm">
                    <div className="flex items-center justify-center cursor-pointer hover:text-gray-200" onClick={() => handleSort('grandTotal')}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Total
                      {sortField === 'grandTotal' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-sm">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className="hover:bg-gray-50 transition-colors duration-150">
                      {/* Period Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-gray-700 text-white rounded-md px-3 py-1.5 text-sm font-medium">
                            {item.month} {item.year}
                          </div>
                          {getTrendIcon(item.grandTotal, index > 0 ? filteredData[index - 1].grandTotal : null)}
                        </div>
                      </td>

                      {/* CTQ Column */}
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 mb-2">{item.ctq.total.toLocaleString()}</div>
                          <div className="flex justify-center space-x-1">
                            {(['l1', 'l2', 'l3', 'l4'] as const).map((line) => {
                              const { color } = getEfficiencyStatus(item.ctq[line]);
                              return (
                                <span key={line} className={`px-2 py-1 rounded text-xs font-medium border ${color}`}>
                                  {item.ctq[line]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* PDI Column */}
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 mb-2">{item.pdi.total.toLocaleString()}</div>
                          <div className="flex justify-center space-x-1">
                            {(['l1', 'l2', 'l3', 'l4'] as const).map((line) => {
                              const { color } = getEfficiencyStatus(item.pdi[line]);
                              return (
                                <span key={line} className={`px-2 py-1 rounded text-xs font-medium border ${color}`}>
                                  {item.pdi[line]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Other Column */}
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 mb-2">{item.other.total.toLocaleString()}</div>
                          <div className="flex justify-center space-x-1">
                            {(['l1', 'l2', 'l3', 'l4'] as const).map((line) => {
                              const { color } = getEfficiencyStatus(item.other[line]);
                              return (
                                <span key={line} className={`px-2 py-1 rounded text-xs font-medium border ${color}`}>
                                  {item.other[line]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Grand Total Column */}
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className="inline-flex items-center bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-xl">
                            {item.grandTotal.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">units</div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row Details */}
                    {expandedRow === index && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* CTQ Details */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                                CTQ Line Performance
                              </h4>
                              <div className="space-y-3">
                                {(['l1', 'l2', 'l3', 'l4'] as const).map((line) => (
                                  <div key={line} className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 uppercase">Line {line.toUpperCase()}:</span>
                                    <div className="flex items-center">
                                      <span className="font-semibold text-gray-900 mr-2">{item.ctq[line]}</span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {((item.ctq[line] / 250) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* PDI Details */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <div className="w-3 h-3 bg-gray-600 rounded-full mr-2"></div>
                                PDI Line Performance
                              </h4>
                              <div className="space-y-3">
                                {(['l1', 'l2', 'l3', 'l4'] as const).map((line) => (
                                  <div key={line} className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 uppercase">Line {line.toUpperCase()}:</span>
                                    <div className="flex items-center">
                                      <span className="font-semibold text-gray-900 mr-2">{item.pdi[line]}</span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {((item.pdi[line] / 250) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Other Details */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <div className="w-3 h-3 bg-gray-700 rounded-full mr-2"></div>
                                Other Line Performance
                              </h4>
                              <div className="space-y-3">
                                {(['l1', 'l2', 'l3', 'l4'] as const).map((line) => (
                                  <div key={line} className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 uppercase">Line {line.toUpperCase()}:</span>
                                    <div className="flex items-center">
                                      <span className="font-semibold text-gray-900 mr-2">{item.other[line]}</span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {((item.other[line] / 250) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredData.length} of {data.length} records
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Efficiency Legend:</span>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded mr-1"></div>
                      <span className="text-xs text-gray-600">90%+</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-1"></div>
                      <span className="text-xs text-gray-600">80-89%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-1"></div>
                      <span className="text-xs text-gray-600">70-79%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded mr-1"></div>
                      <span className="text-xs text-gray-600">&lt;70%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDataTable;