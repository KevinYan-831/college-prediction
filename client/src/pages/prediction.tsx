import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { predictionRequestSchema, type PredictionRequest, type PredictionResult } from "@shared/schema";
import { GraduationCap, Calendar, Languages, Edit, Wind, University, Loader2, RotateCcw, MapPin, FileText, Download, Plus, X, Star, AlertTriangle, Info, Lock, LogOut, User, Sparkles } from "lucide-react";
import * as htmlToImage from 'html-to-image';
import { useAuth } from "@/contexts/AuthContext";
import { UnlockCodeInput } from "@/components/UnlockCodeInput";

export default function PredictionPage() {
  const { user, signOut, checkIfPredictionUnlocked } = useAuth();
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(100);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);


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
      dreamUniversities: ["", "", ""]
    }
  });

  // Check unlock status when results change
  useEffect(() => {
    const checkUnlock = async () => {
      if (results?.sessionId) {
        const unlocked = await checkIfPredictionUnlocked(results.sessionId);
        setIsUnlocked(unlocked);
      }
    };
    checkUnlock();
  }, [results, checkIfPredictionUnlocked]);

  const handleUnlockSuccess = async () => {
    if (results?.sessionId) {
      const unlocked = await checkIfPredictionUnlocked(results.sessionId);
      setIsUnlocked(unlocked);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const predictionMutation = useMutation({
    mutationFn: async (data: PredictionRequest) => {
      const response = await apiRequest("POST", "/api/predict", data);
      return response.json();
    },
    onSuccess: (data: PredictionResult) => {
      console.log('API result:', data);
      setResults(data);
      setIsLoading(false);
      setIsUnlocked(false); // Reset unlock status for new prediction
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
    // Filter out empty universities before submitting
    const filteredData = {
      ...data,
      dreamUniversities: data.dreamUniversities.filter(u => u.trim() !== "")
    };

    console.log("Form submitted successfully with data:", filteredData);
    setIsLoading(true);
    setResults(null);
    setLoadingProgress(0);
    setEstimatedTime(100);
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        // 100秒内均匀分布进度：每秒约1%
        const increment = 1;
        return Math.min(prev + increment, 95);
      });
      
      setEstimatedTime(prev => Math.max(prev - 1, 0));
    }, 1000); // 每秒更新一次
    
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
    
    predictionMutation.mutate(filteredData, {
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

  const handleSaveImage = async () => {
    if (!resultsRef.current) return;
    
    setIsSavingImage(true);
    try {
      const dataUrl = await htmlToImage.toPng(resultsRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: resultsRef.current.scrollWidth,
        height: resultsRef.current.scrollHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const link = document.createElement('a');
      link.download = `AI美本录取预测-${new Date().toLocaleDateString()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "保存成功",
        description: "预测结果已保存为图片",
      });
    } catch (error) {
      console.error('保存图片失败:', error);
      toast({
        title: "保存失败",
        description: "请重试或联系技术支持",
        variant: "destructive"
      });
    } finally {
      setIsSavingImage(false);
    }
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 via-yellow-100/30 to-amber-100/30"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-orange-200/40 to-yellow-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-amber-200/40 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 container mx-auto px-2 sm:px-6 py-4 sm:py-8">
        {/* User Profile Header */}
        <div className="flex justify-end mb-4 px-2">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-orange-200/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">{user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 px-3 hover:bg-orange-100 rounded-full"
            >
              <LogOut className="h-4 w-4 mr-1" />
              退出
            </Button>
          </div>
        </div>

        <header className="text-center mb-6 sm:mb-12 px-2">
          <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-5xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2 sm:mb-4 px-2">
            AI美本录取算命大师
          </h1>
          <p className="text-sm sm:text-xl text-gray-800 max-w-2xl mx-auto px-4">
            融合传统命理智慧与现代AI技术，为您的美国本科申请提供精准预测
          </p>
        </header>

        {/* Input Form */}
        <Card className="mb-4 sm:mb-8 bg-white/90 backdrop-blur-xl border-orange-200/50 shadow-2xl mx-2 sm:mx-0">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 backdrop-blur-xl border-b border-orange-200/30">
            <CardTitle className="flex items-center text-gray-900 text-lg sm:text-xl">
              <Edit className="text-orange-600 mr-2 sm:mr-3" size={20} />
              输入预测信息
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("=== FORM VALIDATION FAILED ===");
                console.log("All errors:", errors);
                console.log("Current form values:", form.getValues());

                // Show specific error messages
                const errorMessages = Object.entries(errors).map(([field, error]: [string, any]) => {
                  return `${field}: ${error.message || JSON.stringify(error)}`;
                }).join('\n');

                console.log("Error messages:\n", errorMessages);

                toast({
                  title: "表单验证失败",
                  description: errorMessages || "请检查并填写所有必填项",
                  variant: "destructive"
                });
              })} className="space-y-6">
                {/* 生辰八字输入 */}
                <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-orange-200/30">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                    <Calendar className="text-orange-500 mr-2 sm:mr-3" size={16} />
                    生辰八字信息
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
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
                <div className="grid grid-cols-1 gap-3 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-medium">性别</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/90 border-orange-200 text-gray-800 focus:bg-white focus:border-orange-400 rounded-xl h-10 sm:h-12">
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
                            className="bg-white/90 border-orange-200 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-orange-400 rounded-xl h-10 sm:h-12 text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>



                {/* 心仪院校列表 */}
                <DreamUniversitiesField form={form} />



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
                    预计剩余：{estimatedTime > 0 ? estimatedTime + ' 秒' : '即将生成结果'}
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
                      <span className="font-mono bg-orange-100 px-2 py-1 rounded text-orange-800 font-semibold">OFFERSTUDIO2025</span>
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
            {/* 保存图片按钮 */}
            <div className="text-center px-2">
              <Button 
                onClick={handleSaveImage}
                disabled={isSavingImage}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 shadow-xl"
              >
                {isSavingImage ? (
                  <Loader2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Download className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                )}
                {isSavingImage ? "生成图片中..." : "保存结果为图片"}
              </Button>
            </div>
            
            {/* 结果内容区域，将被截图 */}
            <div ref={resultsRef} className="bg-white p-8 rounded-2xl space-y-8">
              {/* 标题 */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">
                  AI美本录取算命大师
                </h1>
                <p className="text-gray-600 text-sm">
                  融合传统命理智慧与现代AI技术的专业预测报告
                </p>
              </div>

              {/* 命理分析结果 */}
              <Card className="bg-white/90 backdrop-blur-xl border-orange-200/50 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border-b border-orange-200/30">
                <CardTitle className="flex items-center justify-between text-gray-900 text-xl">
                  <div className="flex items-center">
                    <Wind className="mr-3 text-orange-600" size={24} />
                    命理分析结果
                  </div>
                  <InfoModal />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 sm:p-6 rounded-2xl backdrop-blur-sm">
                    <h4 className="font-semibold text-orange-700 mb-3 text-base sm:text-lg">整体分析</h4>
                    {(() => {
                      const analysisText = (results.fortuneAnalysis.analysis || '').toString().trim() ||
                        (results.fortuneAnalysis.fiveElements || '').toString().trim() ||
                        (results.fortuneAnalysis.recommendations || '').toString().trim();
                      if (analysisText) {
                        return (
                          <div className="text-gray-800 leading-7 text-sm sm:text-base whitespace-pre-wrap break-words max-w-none"
                               style={{ lineHeight: '1.8', wordBreak: 'break-word' }}>
                            {analysisText}
                          </div>
                        );
                      }
                      return <div className="text-gray-500 text-sm italic">分析数据暂时无法显示，请稍后重试</div>;
                    })()}
                  </div>
                  {results.fortuneAnalysis.fiveElements && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 sm:p-6 rounded-2xl backdrop-blur-sm">
                      <h4 className="font-semibold text-yellow-700 mb-3 text-base sm:text-lg">五行分析</h4>
                      <div className="text-gray-800 leading-7 text-sm sm:text-base whitespace-pre-wrap break-words max-w-none" style={{ lineHeight: '1.8', wordBreak: 'break-word' }}>
                        {results.fortuneAnalysis.fiveElements}
                      </div>
                    </div>
                  )}
                  {results.fortuneAnalysis.academicFortune && (
                    <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-400 p-4 sm:p-6 rounded-2xl backdrop-blur-sm">
                      <h4 className="font-semibold text-blue-700 mb-3 text-base sm:text-lg">学业运势</h4>
                      <div className="text-gray-800 leading-7 text-sm sm:text-base whitespace-pre-wrap break-words max-w-none" style={{ lineHeight: '1.8', wordBreak: 'break-word' }}>
                        {results.fortuneAnalysis.academicFortune}
                      </div>
                    </div>
                  )}
                  {results.fortuneAnalysis.recommendations && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 sm:p-6 rounded-2xl backdrop-blur-sm">
                      <h4 className="font-semibold text-green-700 mb-3 text-base sm:text-lg">建议 / 详细分节</h4>
                      <div className="text-gray-800 leading-7 text-sm sm:text-base whitespace-pre-wrap break-words max-w-none" style={{ lineHeight: '1.8', wordBreak: 'break-word' }}>
                        {results.fortuneAnalysis.recommendations}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* OFFERSTUDIO 广告信息 - 中间位置 */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 backdrop-blur-xl border-orange-200/50 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl mb-2 sm:mb-4">
                    <span className="text-white font-bold text-lg sm:text-xl">O</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">OFFERSTUDIO</h3>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed px-2 sm:px-0">
                    专业帮助申请美本的同学们制作个人网站和活动网站
                  </p>
                  <div className="flex flex-col gap-2 sm:gap-3 justify-center items-center">
                    <a 
                      href="https://offerstudiowebsite.wixstudio.com/official" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 text-xs sm:text-sm font-medium text-center"
                    >
                      🌐 访问官网
                    </a>
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                      <span>💬 微信联系：</span>
                      <span className="font-mono bg-orange-100 px-2 sm:px-3 py-1 rounded-lg text-orange-800 font-semibold text-xs sm:text-sm">OFFERSTUDIO2025</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 大学录取预测结果 */}
            <Card className="bg-white/90 backdrop-blur-xl border-orange-200/50 shadow-2xl overflow-hidden relative">
              <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 backdrop-blur-xl border-b border-orange-200/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-gray-900 text-xl">
                    <University className="mr-3 text-yellow-600" size={24} />
                    美国大学录取预测
                  </CardTitle>
                  {!isUnlocked && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <Lock className="h-5 w-5" />
                      <span className="text-sm font-semibold">需解锁</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-8 relative">
                {/* Unlock overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/60 flex items-center justify-center p-6">
                    <div className="text-center space-y-6 max-w-md">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-2xl">
                        <Lock className="h-10 w-10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">解锁完整AI大学预测</h3>
                        <p className="text-gray-600">
                          包含{results.universityPredictions.length}所院校的详细录取分析、命理契合度评估及专业建议
                        </p>
                      </div>
                      <div className="space-y-3 pt-4">
                        <UnlockCodeInput
                          sessionId={results.sessionId || ''}
                          onUnlockSuccess={handleUnlockSuccess}
                        />
                        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                          <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <p>联系管理员获取您的专属解锁码，每个解锁码与您的账户绑定</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`space-y-4 sm:space-y-6 ${isUnlocked ? '' : 'filter blur-sm'}`}>
                  {/* 显示所有大学 */}
                  {results.universityPredictions.map((university, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-lg border border-orange-200/50 rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">{university.chineseName}</h4>
                          <p className="text-gray-700 text-sm sm:text-base">{university.name} - {university.major}</p>
                        </div>
                        <span className={`self-start px-3 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap ${
                          university.admissionProbability === '极高' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                          university.admissionProbability === '较高' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                          university.admissionProbability === '中等' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                          university.admissionProbability === '较低' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                          'bg-gradient-to-r from-red-500 to-red-600 text-white'
                        }`}>
                          录取概率：{university.admissionProbability || '中等'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="mr-2" size={16} />
                        <span className="font-medium">{university.location}</span>
                      </div>
                      {university.specialNote && (
                        <div className="mb-4 p-4 bg-red-50/80 border-l-4 border-red-400 rounded-xl">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="text-red-500 mr-2" size={16} />
                            <span className="font-semibold text-red-700">专业提示</span>
                          </div>
                          <p className="text-red-800 text-sm">{university.specialNote}</p>
                        </div>
                      )}
                      {university.reasons && (
                        <p className="text-gray-800 leading-relaxed bg-orange-50/50 p-3 sm:p-4 rounded-xl text-sm sm:text-base">{university.reasons}</p>
                      )}
                    </div>
                  ))}


                </div>
              </CardContent>
            </Card>

            {/* OFFERSTUDIO 广告信息 */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 backdrop-blur-xl border-orange-200/50 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl mb-2 sm:mb-4">
                    <span className="text-white font-bold text-lg sm:text-xl">O</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">OFFERSTUDIO</h3>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed px-2 sm:px-0">
                    专业帮助申请美本的同学们制作个人网站和活动网站
                  </p>
                  <div className="flex flex-col gap-2 sm:gap-3 justify-center items-center">
                    <a 
                      href="https://offerstudiowebsite.wixstudio.com/official" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 text-xs sm:text-sm font-medium text-center"
                    >
                      🌐 访问官网
                    </a>
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                      <span>💬 微信联系：</span>
                      <span className="font-mono bg-orange-100 px-2 sm:px-3 py-1 rounded-lg text-orange-800 font-semibold text-xs sm:text-sm">OFFERSTUDIO2025</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            </div>

            {/* 底部按钮组 */}
            <div className="space-y-4 px-2">
              {/* 底部保存图片按钮 */}
              <div className="text-center">
                <Button 
                  onClick={handleSaveImage}
                  disabled={isSavingImage}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  {isSavingImage ? (
                    <Loader2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Download className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  {isSavingImage ? "生成图片中..." : "保存结果为图片"}
                </Button>
              </div>

              {/* 重新预测按钮 */}
              <div className="text-center">
                <Button 
                  onClick={handleReset}
                  className="w-full sm:w-auto bg-orange-100/50 hover:bg-orange-200/50 text-gray-800 border border-orange-200/50 backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105"
                >
                  <RotateCcw className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  重新预测
                </Button>
              </div>
            </div>
          </div>
        )}


        
        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="bg-orange-50/70 backdrop-blur-sm rounded-2xl p-8 border border-orange-200/30">
            <p className="text-gray-700 mb-2 text-lg font-medium">© 2025 AI美本录取算命大师</p>
            <p className="text-gray-600">融合传统智慧与现代科技，为您的求学之路保驾护航</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// 命理分析信息弹窗组件
function InfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-orange-100/50 rounded-full"
        >
          <Info className="h-4 w-4 text-orange-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-orange-200">
        <DialogHeader>
          <DialogTitle className="flex items-center text-orange-800">
            <Info className="mr-2 h-5 w-5" />
            盲派八字算命分析逻辑
          </DialogTitle>
          <DialogDescription>
            了解本系统使用的传统命理分析方法和理论基础
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
            <p className="font-medium text-orange-800 mb-2">什么是盲派八字算命？</p>
            <p>盲派八字算命是中国传统命理学的一个分支，它以阴阳五行为基础，通过分析一个人的出生时间（八字）来推测其命运轨迹。盲派命理的特点是强调实用口诀和快速推演，并有独特的理论体系，如宾主、体用、做功等。盲派命理的传承主要依靠盲人口传心授，因此带有一定的神秘色彩。</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">核心概念：</h4>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-800">八字</h5>
                <p>由出生年、月、日、时的天干地支组合而成，共八个字，是命理分析的基础。</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-800">阴阳五行</h5>
                <p>构成命理分析的基本元素，包括金、木、水、火、土五行，以及阴阳两种属性。</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-800">十神</h5>
                <p>对五行的生克关系进行细分，用来分析六亲关系、性格特点、事业财运等。</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-800">宾主、体用、做功</h5>
                <p>盲派命理特有的推演规则，用于分析命局的吉凶、强弱、以及命运的起伏变化。</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-800">口诀</h5>
                <p>盲派命理中，用简短的口诀来辅助推算，帮助快速得出结论。</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">盲派八字算命的特点：</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium">快速推演：</span>
                  <span>盲派命理强调快速、直接地推断命运，不拘泥于复杂的分析过程。</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium">实用性强：</span>
                  <span>盲派命理在实际应用中，能够较准确地推断六亲、婚姻、事业、财运等。</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-medium">口传心授：</span>
                  <span>盲派命理的传承方式使得其理论和技巧带有一定的独特性和神秘性。</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-blue-800">
              <strong>注意：</strong>本系统基于盲派八字理论进行命理分析。分析结果仅供参考，不应作为人生决策的唯一依据。
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 心仪院校列表组件
function DreamUniversitiesField({ form }: { form: any }) {
  const dreamUniversities = form.watch("dreamUniversities") || [];

  const addUniversity = () => {
    const current = form.getValues("dreamUniversities");
    form.setValue("dreamUniversities", [...current, ""], { shouldValidate: true });
  };

  const removeUniversity = (index: number) => {
    const current = form.getValues("dreamUniversities");
    if (current.length > 1) {
      const updated = current.filter((_: string, i: number) => i !== index);
      form.setValue("dreamUniversities", updated, { shouldValidate: true });
    }
  };

  const updateUniversity = (index: number, value: string) => {
    const current = form.getValues("dreamUniversities");
    current[index] = value;
    form.setValue("dreamUniversities", [...current], { shouldValidate: true });
  };

  // 热门大学列表供快速选择
  const popularUniversities = [
    "Harvard University", "Stanford University", "Massachusetts Institute of Technology",
    "Yale University", "Princeton University", "Columbia University",
    "University of Pennsylvania", "University of Chicago", "Duke University",
    "Northwestern University", "Cornell University", "Brown University",
    "University of California--Berkeley", "University of California--Los Angeles",
    "University of Michigan--Ann Arbor", "New York University", "Carnegie Mellon University",
    "University of Southern California", "Georgetown University", "Emory University",
    "University of Virginia", "University of North Carolina--Chapel Hill",
    "Boston University", "Northeastern University", "University of Florida",
    "University of Texas at Austin", "Georgia Institute of Technology",
    "University of Washington", "University of Illinois Urbana-Champaign"
  ];

  const fieldError = form.formState.errors.dreamUniversities;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Star className="text-amber-600 mr-3" size={20} />
        你的心仪院校列表
      </h3>

      {fieldError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{fieldError.message as string}</span>
        </div>
      )}

      <div className="space-y-4">
        {dreamUniversities.map((university: string, index: number) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder={`心仪院校 ${index + 1}`}
                value={university}
                onChange={(e) => updateUniversity(index, e.target.value)}
                className="bg-white/90 border-orange-200 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-orange-400 rounded-xl h-12"
              />
            </div>
            {dreamUniversities.length > 1 && (
              <Button
                type="button"
                onClick={() => removeUniversity(index)}
                className="bg-red-100 hover:bg-red-200 text-red-600 border-red-200 rounded-xl h-12 px-3"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        ))}
        
        {dreamUniversities.length < 20 && (
          <Button
            type="button"
            onClick={addUniversity}
            className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200 rounded-xl h-12 font-medium"
          >
            <Plus className="mr-2" size={16} />
            添加更多院校
          </Button>
        )}
      </div>

      {/* 热门大学快速选择 */}
      <div className="mt-6">
        <Label className="text-gray-700 font-medium mb-3 block">热门院校快速选择：</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          {popularUniversities.map((uni) => (
            <Button
              key={uni}
              type="button"
              onClick={() => {
                const emptyIndex = dreamUniversities.findIndex((u: string) => u === "");
                if (emptyIndex !== -1) {
                  updateUniversity(emptyIndex, uni);
                } else if (dreamUniversities.length < 20) {
                  addUniversity();
                  setTimeout(() => updateUniversity(dreamUniversities.length, uni), 0);
                }
              }}
              className="text-left justify-start bg-white/50 hover:bg-white text-gray-700 border border-orange-100 rounded-lg h-8 px-3 text-xs font-normal"
            >
              {uni.length > 25 ? uni.substring(0, 25) + "..." : uni}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
