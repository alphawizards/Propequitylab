import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { User, Mail, Crown, UserPlus } from 'lucide-react';

const MembersModal = ({ isOpen, onClose, members }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Portfolio Members</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground flex items-center gap-2">
                    {member.name}
                    {member.role === 'Owner' && (
                      <Crown className="w-4 h-4 text-gold-500" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                member.role === 'Owner'
                  ? 'bg-gold/20 text-gold-700'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {member.role}
              </span>

            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
