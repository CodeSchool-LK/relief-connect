import React from 'react';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';
import { RATION_ITEMS } from './EmergencyRequestForm';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Package, CheckCircle, Clock } from 'lucide-react';

interface CampInventoryDisplayProps {
  inventoryItems: ICampInventoryItem[];
}

export default function CampInventoryDisplay({ inventoryItems }: CampInventoryDisplayProps) {
  if (!inventoryItems || inventoryItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Camp Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No inventory items yet</p>
        </CardContent>
      </Card>
    );
  }

  const getItemLabel = (itemName: string): string => {
    const item = RATION_ITEMS.find(r => r.id === itemName);
    return item ? item.label : itemName;
  };

  const getItemIcon = (itemName: string): string => {
    const item = RATION_ITEMS.find(r => r.id === itemName);
    return item ? item.icon : '📦';
  };

  const calculateProgress = (needed: number, donated: number, pending: number): number => {
    if (needed === 0) return 100;
    const totalReceived = donated + pending;
    return Math.min(100, (totalReceived / needed) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5" />
          Camp Inventory ({inventoryItems.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inventoryItems.map((item) => {
            const progress = calculateProgress(item.quantityNeeded, item.quantityDonated, item.quantityPending);
            const isComplete = item.quantityDonated >= item.quantityNeeded && item.quantityNeeded > 0;
            const totalReceived = item.quantityDonated + item.quantityPending;

            return (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getItemIcon(item.itemName)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{getItemLabel(item.itemName)}</h4>
                      <p className="text-xs text-gray-500">Item: {item.itemName}</p>
                    </div>
                  </div>
                  {isComplete && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Complete
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isComplete
                          ? 'bg-green-500'
                          : progress >= 50
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Quantity Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-xs text-gray-600 mb-1">Needed</div>
                    <div className="font-bold text-blue-700">{item.quantityNeeded}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Donated
                    </div>
                    <div className="font-bold text-green-700">{item.quantityDonated}</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </div>
                    <div className="font-bold text-yellow-700">{item.quantityPending}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-600 mb-1">Total Received</div>
                    <div className="font-bold text-gray-700">{totalReceived}</div>
                  </div>
                </div>

                {/* Remaining Needed */}
                {item.quantityNeeded > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Still needed:</span>
                      <span className={`font-semibold ${
                        item.quantityNeeded - totalReceived <= 0
                          ? 'text-green-600'
                          : item.quantityNeeded - totalReceived <= item.quantityNeeded * 0.5
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {Math.max(0, item.quantityNeeded - totalReceived)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

