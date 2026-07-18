'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface GrowthData {
    name: string
    value: number
}

interface GrowthChartProps {
    data: GrowthData[]
    title: string
    description?: string
}

export function GrowthChart({ data, title, description }: GrowthChartProps) {
    return (
        <Card className="col-span-1 lg:col-span-2 border-gray-100 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#64748b" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#64748b" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    borderRadius: '8px', 
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                }}
                                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#2563eb" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
