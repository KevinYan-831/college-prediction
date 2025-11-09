import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthModal } from '@/components/AuthModal';
import {
  Sparkles,
  Star,
  University,
  Calendar,
  Users,
  TrendingUp,
  Lock,
  Unlock,
  ChevronRight,
  Brain,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: '命理分析',
      description: '基于您的生辰八字，深度解析五行命格、学业运势与人生建议'
    },
    {
      icon: University,
      title: 'AI智能预测',
      description: '结合传统命理与现代AI，为您推荐最匹配的美国大学'
    },
    {
      icon: TrendingUp,
      title: '录取概率',
      description: '根据命理契合度，科学评估您与每所院校的缘分指数'
    },
    {
      icon: Star,
      title: '个性化建议',
      description: '提供定制化的申请策略，助您找到命中注定的学府'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: '注册账号',
      description: '创建您的专属账号，开启算命之旅'
    },
    {
      step: '2',
      title: '输入信息',
      description: '填写生辰八字、意向专业与梦校列表'
    },
    {
      step: '3',
      title: '获取命理分析',
      description: '立即查看您的五行命格与学业运势'
    },
    {
      step: '4',
      title: '解锁完整报告',
      description: '使用解锁码查看AI大学录取预测'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200 via-orange-100 to-transparent opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center space-y-8">
            {/* Logo/Title */}
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-amber-600 animate-pulse" />
              <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                AI美本录取算命大师
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto">
              融合中华传统命理与现代AI科技
              <br />
              <span className="text-amber-700 font-semibold">为您揭秘美国大学录取天机</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                开始测算
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-amber-500 hover:bg-amber-50"
              >
                查看演示
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-amber-600">50+</div>
                <div className="text-sm sm:text-base text-gray-600 mt-1">顶尖大学数据库</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-orange-600">100%</div>
                <div className="text-sm sm:text-base text-gray-600 mt-1">个性化分析</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-red-600">AI驱动</div>
                <div className="text-sm sm:text-base text-gray-600 mt-1">智能预测</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            核心功能
          </h2>
          <p className="text-lg text-gray-600">
            传统智慧与现代科技的完美结合
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-b from-white to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              如何使用
            </h2>
            <p className="text-lg text-gray-600">
              四步开启您的命理录取之旅
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-amber-300 to-orange-300 -z-10" />
                )}

                <div className="text-center space-y-4">
                  <div className="relative inline-flex">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                      {item.step}
                    </div>
                    {index < 2 && (
                      <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-amber-500 animate-pulse" />
                    )}
                    {index === 3 && (
                      <Star className="absolute -top-2 -right-2 h-8 w-8 text-orange-500 animate-pulse" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            预测报告示例
          </h2>
          <p className="text-lg text-gray-600">
            查看完整的命理分析与AI大学预测
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Fortune Analysis Demo */}
          <Card className="border-2 border-amber-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                <CardTitle className="text-2xl">命理分析</CardTitle>
              </div>
              <CardDescription className="text-amber-50">
                基于生辰八字的五行解析
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
                  <div>
                    <p className="font-semibold text-gray-900">八字命格</p>
                    <p className="text-gray-600">甲子年 丙寅月 戊午日 壬子时</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                  <div>
                    <p className="font-semibold text-gray-900">五行分析</p>
                    <p className="text-gray-600">木旺火盛，利于文科与艺术领域发展</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                  <div>
                    <p className="font-semibold text-gray-900">学业运势</p>
                    <p className="text-gray-600">2024-2026年为学业上升期，适合深造</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <Unlock className="h-5 w-5" />
                  <span>登录后立即可见</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* University Predictions Demo */}
          <Card className="border-2 border-gray-200 shadow-xl relative overflow-hidden">
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10 flex items-center justify-center">
              <div className="text-center space-y-4 p-6">
                <Lock className="h-16 w-16 text-amber-600 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-900">解锁完整大学预测</h3>
                <p className="text-gray-600 max-w-md">
                  包含15所院校的详细录取分析、命理契合度评估及专业建议
                </p>
                <div className="flex flex-col gap-2 pt-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Zap className="h-5 w-5" />
                    <span className="font-semibold">需要解锁码</span>
                  </div>
                  <p className="text-sm text-gray-500">联系管理员获取您的专属解锁码</p>
                </div>
              </div>
            </div>

            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <University className="h-6 w-6" />
                <CardTitle className="text-2xl">AI大学预测</CardTitle>
              </div>
              <CardDescription className="text-blue-50">
                深度AI分析与命理匹配
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {[
                { name: 'Harvard University', chinese: '哈佛大学', prob: '较高' },
                { name: 'Stanford University', chinese: '斯坦福大学', prob: '中等' },
                { name: 'MIT', chinese: '麻省理工学院', prob: '极高' }
              ].map((uni, i) => (
                <div key={i} className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{uni.name}</p>
                      <p className="text-sm text-gray-600">{uni.chinese}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {uni.prob}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-400">详细分析内容...</p>
                    <p className="text-sm text-gray-400">命理契合度评估...</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-white">
            准备好开启您的命运之旅了吗？
          </h2>
          <p className="text-xl text-amber-50">
            立即注册，获取专属的美本录取命理分析
          </p>
          <Button
            size="lg"
            onClick={() => setShowAuthModal(true)}
            className="text-xl px-12 py-7 bg-white text-orange-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all"
          >
            <Sparkles className="mr-3 h-6 w-6" />
            免费开始测算
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-bold text-white">AI美本录取算命大师</span>
          </div>
          <p className="text-sm">
            融合传统命理与现代AI科技，助您找到命中注定的学府
          </p>
          <p className="text-xs mt-4">
            © 2024 All rights reserved. Powered by OFFERSTUDIO
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
