import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { predictionRequestSchema, type PredictionRequest, type PredictionResult } from "@shared/schema";
import { GraduationCap, Calendar, Languages, Edit, Wind, University, Loader2, RotateCcw, MapPin } from "lucide-react";

export default function PredictionPage() {
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(20);
  const { toast } = useToast();

  const form = useForm<PredictionRequest>({
    resolver: zodResolver(predictionRequestSchema),
    defaultValues: {
      year: 2000,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      birthDate: "",
      birthTime: "",
      gender: "male",
      major: "",
      testType: "toefl",
      score: 0,
      materialLevel: "average"
    }
  });

  const predictionMutation = useMutation({
    mutationFn: async (data: PredictionRequest) => {
      const response = await apiRequest("POST", "/api/predict", data);
      return response.json();
    },
    onSuccess: (data: PredictionResult) => {
      setResults(data);
      setIsLoading(false);
      toast({
        title: "预测完成",
        description: "AI分析结果已生成",
      });
    },
    onError: (error) => {
      setIsLoading(false);
      console.error("预测失败:", error);
      toast({
        title: "预测失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: PredictionRequest) => {
    setIsLoading(true);
    setResults(null);
    setLoadingProgress(0);
    setEstimatedTime(20);
    
    // 開始進度條動畫
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        // 前10秒進度較快，後面較慢
        const increment = prev < 60 ? 8 : prev < 80 ? 4 : 2;
        return Math.min(prev + increment, 95);
      });
      
      setEstimatedTime(prev => Math.max(prev - 1, 0));
    }, 1000);
    
    // 更新加載消息
    const messageInterval = setInterval(() => {
      const messages = [
        "正在分析您的生辰八字...",
        "调用命理分析API中...", 
        "分析五行属性和性格特质...",
        "调用AI大学预测API...",
        "结合命理因素分析适合的大学...",
        "计算录取可能性...",
        "生成个性化推荐理由...",
        "整理分析结果..."
      ];
      setLoadingMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2500);
    
    predictionMutation.mutate(data, {
      onSettled: () => {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    });
  };

  const handleReset = () => {
    form.reset();
    setResults(null);
    setIsLoading(false);
  };

  // 已移除概率颜色函数，不再显示录取概率百分比
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "bg-green-100 text-green-800";
    if (probability >= 60) return "bg-yellow-100 text-yellow-800";
    if (probability >= 40) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-red-50 relative overflow-hidden">
      {/* 太极背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 大太极图 - 右上角 */}
        <div className="absolute -top-20 -right-20 w-80 h-80 opacity-5">
          <div className="w-full h-full rounded-full bg-black relative overflow-hidden">
            {/* 白色S形部分 */}
            <div className="absolute inset-0">
              <div className="w-full h-1/2 bg-white relative">
                <div className="absolute bottom-0 left-1/2 w-1/2 h-full bg-black rounded-full -translate-x-1/2 translate-y-1/2"></div>
              </div>
              <div className="w-full h-1/2 bg-black relative">
              </div>
            </div>
            {/* 小圆点 */}
            <div className="absolute top-1/4 left-1/2 w-1/4 h-1/4 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-1/4 left-1/2 w-1/4 h-1/4 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
          </div>
        </div>
        
        {/* 小太极图 - 左下角 */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 opacity-10">
          <div className="w-full h-full rounded-full bg-red-800 relative overflow-hidden">
            {/* 金色S形部分 */}
            <div className="absolute inset-0">
              <div className="w-full h-1/2 bg-amber-100 relative">
                <div className="absolute bottom-0 left-1/2 w-1/2 h-full bg-red-800 rounded-full -translate-x-1/2 translate-y-1/2"></div>
              </div>
              <div className="w-full h-1/2 bg-red-800 relative">
                <div className="absolute top-0 left-1/2 w-1/2 h-full bg-amber-100 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
            {/* 小圆点 */}
            <div className="absolute top-1/4 left-1/2 w-1/4 h-1/4 bg-red-800 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-1/4 left-1/2 w-1/4 h-1/4 bg-amber-100 rounded-full -translate-x-1/2 translate-y-1/2"></div>
          </div>
        </div>
        
        {/* 五行元素装饰 - 右中 */}
        <div className="absolute top-1/3 right-20 w-32 h-32 opacity-8">
          <div className="text-amber-800/20 text-2xl font-bold space-y-1">
            <div>金</div>
            <div>木</div>
            <div>水</div>
            <div>火</div>
            <div>土</div>
          </div>
        </div>
        
        {/* 八卦符号装饰 */}
        <div className="absolute top-1/4 right-1/4 text-6xl text-amber-800/10 font-bold">☯</div>
        <div className="absolute bottom-1/3 left-1/4 text-4xl text-red-800/10 font-bold">☯</div>
      </div>
      
      {/* Header */}
      <header className="bg-gradient-to-r from-white/90 to-amber-50/90 backdrop-blur-sm shadow-lg border-b border-amber-200/50 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 mr-4 rounded-full bg-black relative shadow-lg overflow-hidden">
                {/* 标题太极图 - 正确的S形 */}
                <div className="absolute inset-0">
                  <div className="w-full h-1/2 bg-white relative">
                    <div className="absolute bottom-0 left-1/2 w-1/2 h-full bg-black rounded-full -translate-x-1/2 translate-y-1/2"></div>
                  </div>
                  <div className="w-full h-1/2 bg-black relative">
                  </div>
                </div>
                {/* 小圆点 */}
                <div className="absolute top-1/4 left-1/2 w-1/4 h-1/4 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 via-red-700 to-amber-900 bg-clip-text text-transparent">
                AI美本录取算命大师
              </h1>
            </div>
            <p className="text-amber-800/80 font-medium">融合传统命理与现代AI技术 • 精准预测美国大学录取</p>
            <div className="mt-1 text-sm text-amber-700/60">
              基于生辰八字五行分析 • 智能匹配最适合的学府
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Input Form */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border-amber-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Edit className="text-primary mr-3" size={24} />
              输入信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 生辰八字输入 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Calendar className="text-red-600 mr-2" size={20} />
                    生辰八字信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>出生日期</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              onChange={(e) => {
                                const date = new Date(e.target.value);
                                if (!isNaN(date.getTime())) {
                                  form.setValue('year', date.getFullYear());
                                  form.setValue('month', date.getMonth() + 1);
                                  form.setValue('day', date.getDate());
                                }
                                field.onChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>出生時辰</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field}
                              onChange={(e) => {
                                const [hour, minute] = e.target.value.split(':').map(Number);
                                if (!isNaN(hour) && !isNaN(minute)) {
                                  form.setValue('hour', hour);
                                  form.setValue('minute', minute);
                                }
                                field.onChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>性别</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择性别" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">男</SelectItem>
                            <SelectItem value="female">女</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="major"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>申请专业</FormLabel>
                        <FormControl>
                          <Input placeholder="如：计算机科学" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 语言成绩 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Languages className="text-yellow-600 mr-2" size={20} />
                    语言成绩
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="testType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>考试类型</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择考试类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="toefl">托福 (TOEFL)</SelectItem>
                              <SelectItem value="ielts">雅思 (IELTS)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="score"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>分数</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="如：105" 
                              {...field}
                              value={field.value === 0 ? "" : field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                  field.onChange(undefined);
                                } else {
                                  const numValue = parseInt(value);
                                  if (!isNaN(numValue)) {
                                    field.onChange(numValue);
                                  }
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 申请材料水平 */}
                <FormField
                  control={form.control}
                  name="materialLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>申请材料整体水平</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择整体水平" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="very-poor">极差</SelectItem>
                          <SelectItem value="poor">较差</SelectItem>
                          <SelectItem value="average">一般</SelectItem>
                          <SelectItem value="good">较好</SelectItem>
                          <SelectItem value="excellent">极好</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 提交按钮 */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-blue-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI正在分析中...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        开始AI预测分析
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Enhanced Loading State */}
        {isLoading && (
          <Card className="mb-8 bg-white/90 backdrop-blur-sm border-amber-200/50 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-red-100 rounded-full mb-4 border-2 border-amber-200/50">
                  <div className="w-8 h-8 rounded-full bg-black relative animate-spin overflow-hidden">
                    {/* 加载太极图 - 正确的S形 */}
                    <div className="absolute inset-0">
                      <div className="w-full h-1/2 bg-white relative">
                        <div className="absolute bottom-0 left-1/2 w-1/2 h-full bg-black rounded-full -translate-x-1/2 translate-y-1/2"></div>
                      </div>
                      <div className="w-full h-1/2 bg-black relative">
                        <div className="absolute top-0 left-1/2 w-1/2 h-full bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>
                    {/* 小圆点 */}
                    <div className="absolute top-1/4 left-1/2 w-1/4 h-1/4 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-1/4 left-1/2 w-1/4 h-1/4 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-800 to-red-700 bg-clip-text text-transparent mb-2">AI算命大师分析中...</h3>
                <p className="text-gray-600 mb-4">{loadingMessage}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-amber-100/50 rounded-full h-3 mb-4 border border-amber-200/50">
                  <div 
                    className="bg-gradient-to-r from-amber-500 via-red-500 to-amber-600 h-3 rounded-full transition-all duration-1000 ease-in-out shadow-inner"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">完成进度：{loadingProgress}%</span>
                  <span className="text-sm text-gray-600">
                    预计剩余：{estimatedTime > 0 ? estimatedTime + ' 秒' : '即将完成'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${loadingProgress > 20 ? 'bg-green-500' : 'bg-gray-300'} ${loadingProgress <= 20 ? 'animate-pulse' : ''}`}></div>
                    <span className="text-sm text-gray-600">命理分析API</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${loadingProgress > 60 ? 'bg-green-500' : 'bg-gray-300'} ${loadingProgress > 20 && loadingProgress <= 60 ? 'animate-pulse' : ''}`}></div>
                    <span className="text-sm text-gray-600">大学预测API</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${loadingProgress > 90 ? 'bg-green-500' : 'bg-gray-300'} ${loadingProgress > 60 && loadingProgress <= 90 ? 'animate-pulse' : ''}`}></div>
                    <span className="text-sm text-gray-600">结果整理</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {results && !isLoading && (
          <div className="space-y-6">
            {/* 命理分析结果 */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardTitle className="flex items-center">
                  <Wind className="mr-3" size={24} />
                  命理分析结果
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <h4 className="font-semibold text-red-800 mb-2">整体分析</h4>
                    <p className="text-red-700">{results.fortuneAnalysis.analysis}</p>
                  </div>
                  {results.fortuneAnalysis.fiveElements && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <h4 className="font-semibold text-yellow-800 mb-2">五行分析</h4>
                      <p className="text-yellow-700">{results.fortuneAnalysis.fiveElements}</p>
                    </div>
                  )}
                  {results.fortuneAnalysis.academicFortune && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <h4 className="font-semibold text-blue-800 mb-2">学业运势</h4>
                      <p className="text-blue-700">{results.fortuneAnalysis.academicFortune}</p>
                    </div>
                  )}
                  {results.fortuneAnalysis.recommendations && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                      <h4 className="font-semibold text-green-800 mb-2">建议</h4>
                      <p className="text-green-700">{results.fortuneAnalysis.recommendations}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 大学录取预测结果 */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="flex items-center">
                  <University className="mr-3" size={24} />
                  美国大学录取预测
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {results.universityPredictions.map((university, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">{university.chineseName}</h4>
                          <p className="text-gray-600 text-sm">{university.name} - {university.major}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          推荐录取
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="mr-1" size={14} />
                        <span>{university.location}</span>
                      </div>
                      {university.reasons && (
                        <p className="text-sm text-gray-600">{university.reasons}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 重新预测按钮 */}
            <div className="text-center">
              <Button 
                onClick={handleReset}
                variant="outline"
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                重新预测
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p className="mb-2">© 2024 AI美国大学录取预测系统</p>
            <p className="text-sm">结合传统智慧与现代科技，为您的求学之路保驾护航</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
