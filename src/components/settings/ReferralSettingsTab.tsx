import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1';

interface ReferralSettings {
  defaultFriendRewardValue: number;
  defaultReferrerRewardValue: number;
  defaultMinimumOrderAmount: number;
  isActive: boolean;
  maxUsesPerCode?: number;
  codeExpiryDays?: number;
}

export function ReferralSettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ReferralSettings>({
    defaultFriendRewardValue: 5,
    defaultReferrerRewardValue: 5,
    defaultMinimumOrderAmount: 20,
    isActive: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/referrals/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data || data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load referral settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: "Error",
        description: "Failed to load referral settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/referrals/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Referral settings updated successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Referral Reward Defaults</CardTitle>
          <CardDescription>
            These settings apply to all new user-generated referral codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Friend Reward */}
          <div className="space-y-2">
            <Label htmlFor="friendReward">Friend Reward (£)</Label>
            <Input
              id="friendReward"
              type="number"
              min="0"
              step="0.5"
              value={settings.defaultFriendRewardValue}
              onChange={(e) => setSettings({
                ...settings,
                defaultFriendRewardValue: parseFloat(e.target.value) || 0
              })}
            />
            <p className="text-sm text-muted-foreground">
              Amount new users get when they use a referral code
            </p>
          </div>

          {/* Referrer Reward */}
          <div className="space-y-2">
            <Label htmlFor="referrerReward">Referrer Reward (£)</Label>
            <Input
              id="referrerReward"
              type="number"
              min="0"
              step="0.5"
              value={settings.defaultReferrerRewardValue}
              onChange={(e) => setSettings({
                ...settings,
                defaultReferrerRewardValue: parseFloat(e.target.value) || 0
              })}
            />
            <p className="text-sm text-muted-foreground">
              Amount users get when their friend's order is delivered
            </p>
          </div>

          {/* Minimum Order */}
          <div className="space-y-2">
            <Label htmlFor="minOrder">Minimum Order Amount (£)</Label>
            <Input
              id="minOrder"
              type="number"
              min="0"
              step="1"
              value={settings.defaultMinimumOrderAmount}
              onChange={(e) => setSettings({
                ...settings,
                defaultMinimumOrderAmount: parseFloat(e.target.value) || 0
              })}
            />
            <p className="text-sm text-muted-foreground">
              Minimum order value required to use a referral code
            </p>
          </div>

          {/* Max Uses Per Code (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="maxUses">Max Uses Per Code (Optional)</Label>
            <Input
              id="maxUses"
              type="number"
              min="0"
              step="1"
              value={settings.maxUsesPerCode || ''}
              onChange={(e) => setSettings({
                ...settings,
                maxUsesPerCode: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="Unlimited"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty for unlimited uses
            </p>
          </div>

          {/* Code Expiry Days (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="expiryDays">Code Expiry (Days, Optional)</Label>
            <Input
              id="expiryDays"
              type="number"
              min="0"
              step="1"
              value={settings.codeExpiryDays || ''}
              onChange={(e) => setSettings({
                ...settings,
                codeExpiryDays: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="Never expires"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty for codes that never expire
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Referral Program Active</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable the entire referral program
              </p>
            </div>
            <Switch
              id="isActive"
              checked={settings.isActive}
              onCheckedChange={(checked) => setSettings({ ...settings, isActive: checked })}
            />
          </div>

          <div className="pt-4">
            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
