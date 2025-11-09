import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Unlock, Sparkles } from 'lucide-react';

interface UnlockCodeInputProps {
  sessionId: string;
  onUnlockSuccess: () => void;
  children?: React.ReactNode;
}

export function UnlockCodeInput({ sessionId, onUnlockSuccess, children }: UnlockCodeInputProps) {
  const { unlockPrediction } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast({
        title: '请输入解锁码',
        description: '解锁码不能为空',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await unlockPrediction(sessionId, code);

    if (result.success) {
      toast({
        title: '解锁成功！',
        description: '完整大学预测报告已解锁',
      });
      setCode('');
      setOpen(false);
      onUnlockSuccess();
    } else {
      toast({
        title: '解锁失败',
        description: result.error || '请检查解锁码是否正确',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            <Lock className="mr-2 h-5 w-5" />
            解锁完整预测报告
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-amber-500" />
            解锁AI大学预测
          </DialogTitle>
          <DialogDescription>
            输入解锁码以查看完整的AI大学录取预测报告
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUnlock} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="unlock-code">解锁码</Label>
            <Input
              id="unlock-code"
              type="text"
              placeholder="XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={9}
              className="text-center text-lg font-mono tracking-wider"
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-gray-500 text-center">
              格式: ABCD-EFGH (8位字母或数字)
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900">如何获取解锁码？</p>
                <p className="text-amber-700 mt-1">
                  请联系管理员获取解锁码。解锁后即可查看完整的大学预测分析。VX: OFFERSTUDIO2025
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                验证中...
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-5 w-5" />
                解锁报告
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
