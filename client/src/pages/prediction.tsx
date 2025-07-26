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
import { GraduationCap, Calendar, Languages, Edit, Wind, University, Loader2, RotateCcw, MapPin, FileText } from "lucide-react";

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
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 80) {
          clearInterval(progressInterval);
          return 80;
        }
        // 平均分布的进度增加：每次2-3%
        const increment = 2.5;
        return Math.min(prev + increment, 80);
      });
      
      setEstimatedTime(prev => Math.max(prev - 1, 0));
    }, 1500);
    
    const messageInterval = setInterval(() => {
      const messages = [
        "正在分析您的生辰八字...",
        "调用命理分析API中...", 
        "分析五行属性和性格特质...",
        "调用AI大学预测API...",
        "结合命理因素分析适合的大学...",
        "计算录取可能性...",
        "生成个性化推荐理由...",
        "整理分析结果...",
        "OFFERSTUDIO专注于帮助申请美本的同学们制作个人网站 & 活动类网站..."
      ];
      setLoadingMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2500);
    
    predictionMutation.mutate(data, {
      onSettled: () => {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        // 平滑完成剩余的20%进度
        const finalProgress = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 100) {
              clearInterval(finalProgress);
              setTimeout(() => {
                setIsLoading(false);
              }, 500);
              return 100;
            }
            return prev + 5;
          });
        }, 200);
      }
    });
  };

  const handleReset = () => {
    form.reset();
    setResults(null);
    setIsLoading(false);
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 via-yellow-100/30 to-amber-100/30"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-orange-200/40 to-yellow-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-amber-200/40 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent mb-4">
            AI美本录取算命大师
          </h1>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto">
            融合传统命理智慧与现代AI技术，为您的美国本科申请提供精准预测
          </p>
        </header>

        {/* Input Form */}
        <Card className="mb-8 bg-white/90 backdrop-blur-xl border-orange-200/50 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 backdrop-blur-xl border-b border-orange-200/30">
            <CardTitle className="flex items-center text-gray-900 text-xl">
              <Edit className="text-orange-600 mr-3" size={24} />
              输入预测信息
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 生辰八字输入 */}
                <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Calendar className="text-orange-500 mr-3" size={20} />
                    生辰八字信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-medium">出生日期</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              className="bg-white/90 border-orange-200 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-orange-400 rounded-xl h-12"
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
                          <FormLabel className="text-gray-800 font-medium">出生時辰</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field}
                              className="bg-white/90 border-orange-200 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-orange-400 rounded-xl h-12"
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
                        <FormLabel className="text-gray-800 font-medium">性别</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/90 border-orange-200 text-gray-800 focus:bg-white focus:border-orange-400 rounded-xl h-12">
                              <SelectValue placeholder="请选择性别" className="text-gray-400" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-orange-200">
                            <SelectItem value="male" className="text-gray-800 focus:bg-orange-50">男</SelectItem>
                            <SelectItem value="female" className="text-gray-800 focus:bg-orange-50">女</SelectItem>
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
                        <FormLabel className="text-gray-800 font-medium">申请专业</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="如：计算机科学" 
                            {...field}
                            className="bg-white/90 border-orange-200 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-orange-400 rounded-xl h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 语言成绩 */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Languages className="text-yellow-600 mr-3" size={20} />
                    语言成绩
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="testType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-medium">考试类型</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/90 border-orange-200 text-gray-800 focus:bg-white focus:border-orange-400 rounded-xl h-12">
                                <SelectValue placeholder="选择考试类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white border-orange-200">
                              <SelectItem value="toefl" className="text-gray-800 focus:bg-orange-50">托福 (TOEFL)</SelectItem>
                              <SelectItem value="ielts" className="text-gray-800 focus:bg-orange-50">雅思 (IELTS)</SelectItem>
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
                          <FormLabel className="text-gray-800 font-medium">分数</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="如：105" 
                              {...field}
                              className="bg-white/90 border-orange-200 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-orange-400 rounded-xl h-12"
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
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <FileText className="text-amber-600 mr-3" size={20} />
                    申请材料整体水平评估
                  </h3>
                  <FormField
                    control={form.control}
                    name="materialLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-medium mb-3 block">
                          请根据以下标准客观评估您的申请材料整体水平：
                        </FormLabel>
                        <div className="mb-4 p-4 bg-white/50 rounded-xl border border-orange-100">
                          <div className="text-sm text-gray-700 space-y-2">
                            <div><span className="font-semibold text-red-600">极差:</span> GPA &lt; 3.0，无突出活动经历，无竞赛奖项</div>
                            <div><span className="font-semibold text-orange-600">较差:</span> GPA 3.0-3.3，有基础活动参与，少量校级奖项</div>
                            <div><span className="font-semibold text-yellow-600">一般:</span> GPA 3.3-3.7，有一定活动经历，有州级或地区性奖项</div>
                            <div><span className="font-semibold text-green-600">较好:</span> GPA 3.7-3.9，有显著活动领导经历，有国家级奖项或知名竞赛奖项</div>
                            <div><span className="font-semibold text-emerald-600">极好:</span> GPA 3.9+，有卓越活动成就和领导力，有顶级竞赛奖项(如USAMO、Intel ISEF等)</div>
                          </div>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/90 border-orange-200 text-gray-800 focus:bg-white focus:border-orange-400 rounded-xl h-12">
                              <SelectValue placeholder="请选择您的整体水平" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-orange-200">
                            <SelectItem value="very-poor" className="text-gray-800 focus:bg-orange-50">
                              <div className="flex flex-col">
                                <span className="font-medium">极差</span>
                                <span className="text-xs text-gray-500">GPA &lt; 3.0，无突出经历</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="poor" className="text-gray-800 focus:bg-orange-50">
                              <div className="flex flex-col">
                                <span className="font-medium">较差</span>
                                <span className="text-xs text-gray-500">GPA 3.0-3.3，基础活动</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="average" className="text-gray-800 focus:bg-orange-50">
                              <div className="flex flex-col">
                                <span className="font-medium">一般</span>
                                <span className="text-xs text-gray-500">GPA 3.3-3.7，有地区奖项</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="good" className="text-gray-800 focus:bg-orange-50">
                              <div className="flex flex-col">
                                <span className="font-medium">较好</span>
                                <span className="text-xs text-gray-500">GPA 3.7-3.9，有国家级奖项</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="excellent" className="text-gray-800 focus:bg-orange-50">
                              <div className="flex flex-col">
                                <span className="font-medium">极好</span>
                                <span className="text-xs text-gray-500">GPA 3.9+，顶级竞赛奖项</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>



                {/* 提交按钮 */}
                <div className="pt-8">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-4 rounded-2xl h-14 text-lg shadow-2xl transition-all duration-300 transform hover:scale-[1.02]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        AI正在分析中...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="mr-3 h-5 w-5" />
                        开始AI智能预测分析
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-8 bg-white/90 backdrop-blur-xl border-orange-200/50 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-3xl mb-6 border border-orange-200/50">
                  <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI正在智能分析中...</h3>
                <p className="text-gray-700 mb-8 text-lg">{loadingMessage}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-orange-100 rounded-full h-4 mb-6 backdrop-blur-sm">
                  <div 
                    className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-1000 ease-in-out shadow-lg"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gray-600 font-medium">完成进度：{loadingProgress}%</span>
                  <span className="text-gray-600 font-medium">
                    预计剩余：{estimatedTime > 0 ? estimatedTime + ' 秒' : '即将完成'}
                  </span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-center space-x-3 p-3 rounded-xl bg-orange-50/50">
                    <div className={`w-4 h-4 rounded-full ${loadingProgress > 25 ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg' : 'bg-orange-200'} ${loadingProgress <= 25 ? 'animate-pulse' : ''}`}></div>
                    <span className="text-gray-700 font-medium">命理分析API</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 p-3 rounded-xl bg-orange-50/50">
                    <div className={`w-4 h-4 rounded-full ${loadingProgress > 60 ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg' : 'bg-orange-200'} ${loadingProgress > 25 && loadingProgress <= 60 ? 'animate-pulse' : ''}`}></div>
                    <span className="text-gray-700 font-medium">大学预测API</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 p-3 rounded-xl bg-orange-50/50">
                    <div className={`w-4 h-4 rounded-full ${loadingProgress >= 95 ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg' : 'bg-orange-200'} ${loadingProgress > 60 && loadingProgress < 95 ? 'animate-pulse' : ''}`}></div>
                    <span className="text-gray-700 font-medium">结果整理</span>
                  </div>
                </div>
                
                {/* OFFERSTUDIO推广信息 */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-l-4 border-orange-400">
                  <p className="text-gray-700 text-sm mb-3">
                    <span className="font-semibold text-orange-600">OFFERSTUDIO</span>专注于帮助申请美本的同学们制作个人网站 & 活动类网站
                  </p>
                  <div className="flex flex-col gap-2">
                    <a 
                      href="https://offerstudiowebsite.wixstudio.com/official" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 underline font-medium"
                    >
                      🌐 访问官网了解更多 →
                    </a>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <span>💬 微信联系创始人：</span>
                      <span className="font-mono bg-orange-100 px-2 py-1 rounded text-orange-800 font-semibold">TauPsc-0317</span>
                    </div>
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
            <Card className="bg-white/90 backdrop-blur-xl border-orange-200/50 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border-b border-orange-200/30">
                <CardTitle className="flex items-center text-gray-900 text-xl">
                  <Wind className="mr-3 text-orange-600" size={24} />
                  命理分析结果
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-6 rounded-2xl backdrop-blur-sm">
                    <h4 className="font-semibold text-orange-700 mb-3 text-lg">整体分析</h4>
                    <p className="text-gray-800 leading-relaxed">{results.fortuneAnalysis.analysis}</p>
                  </div>
                  {results.fortuneAnalysis.fiveElements && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-2xl backdrop-blur-sm">
                      <h4 className="font-semibold text-yellow-700 mb-3 text-lg">五行分析</h4>
                      <p className="text-gray-700 leading-relaxed">{results.fortuneAnalysis.fiveElements}</p>
                    </div>
                  )}
                  {results.fortuneAnalysis.academicFortune && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-6 rounded-2xl backdrop-blur-sm">
                      <h4 className="font-semibold text-amber-700 mb-3 text-lg">学业运势</h4>
                      <p className="text-gray-800 leading-relaxed">{results.fortuneAnalysis.academicFortune}</p>
                    </div>
                  )}
                  {results.fortuneAnalysis.recommendations && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-2xl backdrop-blur-sm">
                      <h4 className="font-semibold text-yellow-700 mb-3 text-lg">建议</h4>
                      <p className="text-gray-800 leading-relaxed">{results.fortuneAnalysis.recommendations}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 大学录取预测结果 */}
            <Card className="bg-white/90 backdrop-blur-xl border-orange-200/50 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 backdrop-blur-xl border-b border-orange-200/30">
                <CardTitle className="flex items-center text-gray-900 text-xl">
                  <University className="mr-3 text-yellow-600" size={24} />
                  美国大学录取预测
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* 显示所有大学 */}
                  {results.universityPredictions.map((university, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-lg border border-orange-200/50 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-xl text-gray-900 mb-2">{university.chineseName}</h4>
                          <p className="text-gray-700">{university.name} - {university.major}</p>
                        </div>
                        <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg">
                          推荐录取
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="mr-2" size={16} />
                        <span className="font-medium">{university.location}</span>
                      </div>
                      {university.reasons && (
                        <p className="text-gray-800 leading-relaxed bg-orange-50/50 p-4 rounded-xl">{university.reasons}</p>
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
                className="bg-orange-100/50 hover:bg-orange-200/50 text-gray-800 border border-orange-200/50 backdrop-blur-sm rounded-2xl px-8 py-4 font-semibold text-lg transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="mr-3 h-5 w-5" />
                重新预测
              </Button>
            </div>
          </div>
        )}


        
        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/30">
            <p className="text-gray-700 mb-2 text-lg font-medium">© 2024 AI美国大学录取预测系统</p>
            <p className="text-gray-600">融合传统智慧与现代科技，为您的求学之路保驾护航</p>
          </div>
        </footer>
      </div>
    </div>
  );
}