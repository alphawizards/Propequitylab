import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { User, Lock, Download, Trash2, AlertTriangle, Loader2, Shield, ExternalLink } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import * as api from '../services/api';

const Settings = () => {
  const { toast } = useToast();
  const { user: authUser, logout } = useAuth();
  const { user: userContextUser, updateUser } = useUser();
  const { openUserProfile } = useClerk();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({ name: '', country: 'Australia', state: 'NSW', currency: 'AUD' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteAcknowledge, setDeleteAcknowledge] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const australianStates = [
    { value: 'NSW', label: 'New South Wales' },
    { value: 'VIC', label: 'Victoria' },
    { value: 'QLD', label: 'Queensland' },
    { value: 'WA',  label: 'Western Australia' },
    { value: 'SA',  label: 'South Australia' },
    { value: 'TAS', label: 'Tasmania' },
    { value: 'ACT', label: 'Australian Capital Territory' },
    { value: 'NT',  label: 'Northern Territory' },
  ];

  useEffect(() => {
    if (userContextUser && initialLoad) {
      setProfileData({
        name:     userContextUser.name     || authUser?.name || '',
        country:  userContextUser.country  || 'Australia',
        state:    userContextUser.state    || 'NSW',
        currency: userContextUser.currency || 'AUD',
      });
      setInitialLoad(false);
    }
  }, [userContextUser, authUser, initialLoad]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const updated = await api.updateProfile(profileData);
      toast({ title: 'Profile updated successfully' });
      if (updateUser) updateUser({ name: updated.name, country: updated.country, state: updated.state, currency: updated.currency });
    } catch (error) {
      toast({ variant: 'destructive', title: error.response?.data?.detail || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDataExport = async () => {
    setExportLoading(true);
    try {
      const blob = await api.exportUserData();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `propequitylab-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: 'Data exported successfully' });
    } catch (error) {
      toast({ variant: 'destructive', title: error.response?.data?.detail || 'Failed to export data' });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') { toast({ variant: 'destructive', title: 'Please type DELETE to confirm' }); return; }
    if (!deleteAcknowledge) { toast({ variant: 'destructive', title: 'Please acknowledge that this action is permanent' }); return; }
    setDeleteLoading(true);
    try {
      const result = await api.deleteAccount('DELETE');
      toast({ title: 'Account deleted successfully' });
      setTimeout(async () => {
        await logout();
        navigate('/login', { state: { message: `Your account has been scheduled for deletion. All data will be permanently removed on ${new Date(result.deletion_date).toLocaleDateString()}.` } });
      }, 2000);
    } catch (error) {
      toast({ variant: 'destructive', title: error.response?.data?.detail || 'Failed to delete account' });
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and privacy settings</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sage-soft rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-sage" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
            <p className="text-sm text-muted-foreground">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={authUser?.email || userContextUser?.email || ''} disabled className="h-10 bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={profileData.country} onChange={(e) => setProfileData({ ...profileData, country: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={profileData.state} onValueChange={(value) => setProfileData({ ...profileData, state: value })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {australianStates.map((state) => (
                    <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={profileData.currency} onValueChange={(value) => setProfileData({ ...profileData, currency: value })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUD">AUD (Australian Dollar)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                  <SelectItem value="NZD">NZD (New Zealand Dollar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={profileLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {profileLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
          </Button>
        </form>
      </div>

      {/* Security & Account */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-ocean-soft rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-ocean" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Security & Account</h2>
            <p className="text-sm text-muted-foreground">Manage your password, MFA, and connected accounts</p>
          </div>
        </div>

        <div className="p-4 border border-border rounded-lg flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Password & Security Settings</h3>
            <p className="text-sm text-muted-foreground">
              Change your password, enable two-factor authentication, and manage connected accounts via the secure Clerk account portal.
            </p>
          </div>
          <Button onClick={() => openUserProfile()} variant="outline" className="shrink-0 border-sage text-sage hover:bg-sage-soft hover:border-sage">
            <ExternalLink className="w-4 h-4 mr-2" />Manage Account
          </Button>
        </div>
      </div>

      {/* Privacy & Data */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-plum-soft rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-plum" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Privacy & Data</h2>
            <p className="text-sm text-muted-foreground">Manage your data and privacy preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Download Your Data</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Export all your data in JSON format. Includes portfolios, properties, assets, liabilities, income, and expenses.
                </p>
                <p className="text-xs text-muted-foreground">GDPR Right to Data Portability (Article 20)</p>
              </div>
              <Button onClick={handleDataExport} disabled={exportLoading} variant="outline" className="ml-4">
                {exportLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exporting...</> : <><Download className="w-4 h-4 mr-2" />Export Data</>}
              </Button>
            </div>
          </div>

          <div className="p-4 border border-terra/30 bg-terra-soft rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Delete Account</h3>
                <p className="text-sm text-terra mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone after 30 days.
                </p>
                <p className="text-xs text-terra">GDPR Right to Erasure (Article 17)</p>
              </div>
              <Button onClick={() => setShowDeleteModal(true)} variant="destructive" className="ml-4 bg-terra hover:bg-terra/90">
                <Trash2 className="w-4 h-4 mr-2" />Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-terra-soft rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-terra" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Delete Account</h3>
                <p className="text-sm text-muted-foreground">This action is permanent</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-3 bg-gold-soft border border-gold/30 rounded-lg">
                <p className="text-sm text-foreground"><strong>Warning:</strong> Deleting your account will:</p>
                <ul className="text-sm text-foreground list-disc list-inside mt-2 space-y-1">
                  <li>Immediately deactivate your account</li>
                  <li>Anonymize your personal information</li>
                  <li>Delete all data after 30 days</li>
                  <li>Cancel any active subscriptions</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteConfirm">Type <span className="font-bold">DELETE</span> to confirm</Label>
                <Input id="deleteConfirm" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE" className="h-10" />
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="acknowledge" checked={deleteAcknowledge} onChange={(e) => setDeleteAcknowledge(e.target.checked)} className="mt-1" />
                <label htmlFor="acknowledge" className="text-sm text-foreground cursor-pointer">
                  I understand that this action is permanent and my data will be deleted after 30 days
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteAcknowledge(false); }} variant="outline" className="flex-1" disabled={deleteLoading}>
                Cancel
              </Button>
              <Button onClick={handleDeleteAccount} disabled={deleteLoading} className="flex-1 bg-terra hover:bg-terra/90 text-primary-foreground">
                {deleteLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : 'Delete Forever'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
