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
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl line-clamp-2">{club.name}</CardTitle>
        {club.description && (
          <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1 sm:mt-2">
            {club.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 mb-4 flex-1">
          {club.address && (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
              <span className="break-words">{club.address}</span>
            </div>
          )}
          {club.contactNumber && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="break-all">{club.contactNumber}</span>
            </div>
          )}
          {club.email && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="break-all">{club.email}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2 pt-2 border-t">
          <Link href={`/clubs/${club.id}`} className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
              View Details
            </Button>
          </Link>

          {showRequestButton && onRequestJoin && (
            <>
              {membershipStatus === null && (
                <Button
                  size="sm"
                  onClick={() => onRequestJoin(club.id)}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Request to Support
                </Button>
              )}
              {membershipStatus === 'PENDING' && (
                <span className="text-xs sm:text-sm text-yellow-600 font-medium text-center sm:text-left py-1.5">
                  Request Pending
                </span>
              )}
              {membershipStatus === 'APPROVED' && (
                <span className="text-xs sm:text-sm text-green-600 font-medium text-center sm:text-left py-1.5">
                  Member
                </span>
              )}
              {membershipStatus === 'REJECTED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRequestJoin(club.id)}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
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

