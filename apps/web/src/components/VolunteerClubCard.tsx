import React from 'react';
import Link from 'next/link';
import { IVolunteerClub } from '../types/volunteer-club';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Phone, Mail } from 'lucide-react';

interface VolunteerClubCardProps {
  club: IVolunteerClub;
  onRequestJoin?: (clubId: number) => void;
  membershipStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  showRequestButton?: boolean;
}

export default function VolunteerClubCard({
  club,
  onRequestJoin,
  membershipStatus,
  showRequestButton = true,
}: VolunteerClubCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{club.name}</CardTitle>
        {club.description && <CardDescription className="line-clamp-2">{club.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {club.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{club.address}</span>
            </div>
          )}
          {club.contactNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{club.contactNumber}</span>
            </div>
          )}
          {club.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>{club.email}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link href={`/clubs/${club.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>

          {showRequestButton && onRequestJoin && (
            <>
              {membershipStatus === null && (
                <Button size="sm" onClick={() => onRequestJoin(club.id)}>
                  Request to Join
                </Button>
              )}
              {membershipStatus === 'PENDING' && (
                <span className="text-sm text-yellow-600 font-medium">Request Pending</span>
              )}
              {membershipStatus === 'APPROVED' && (
                <span className="text-sm text-green-600 font-medium">Member</span>
              )}
              {membershipStatus === 'REJECTED' && (
                <Button size="sm" variant="outline" onClick={() => onRequestJoin(club.id)}>
                  Request Again
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

