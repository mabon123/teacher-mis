'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LocationAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_en: '',
    name_kh: '',
    code: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/locations/provinces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create location');
      }

      toast.success('Location created successfully!');
      setFormData({
        name_en: '',
        name_kh: '',
        code: '',
        description: ''
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create location');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Add New Location</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_en">Name (English)</Label>
                <Input
                  id="name_en"
                  name="name_en"
                  type="text"
                  value={formData.name_en}
                  onChange={handleChange}
                  required
                  placeholder="Enter English name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_kh">Name (Khmer)</Label>
                <Input
                  id="name_kh"
                  name="name_kh"
                  type="text"
                  value={formData.name_kh}
                  onChange={handleChange}
                  required
                  placeholder="Enter Khmer name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Enter location code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description (optional)"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Location'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 