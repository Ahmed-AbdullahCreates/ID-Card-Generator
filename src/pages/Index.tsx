import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Image, Printer } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    designation: '',
    year: new Date().getFullYear().toString(),
    photo: null as string | null
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPDF = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight
      });

      // Card dimensions in mm
      const cardWidth = 85.60;
      const cardHeight = 53.98;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [cardWidth, cardHeight]
      });
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, cardWidth, cardHeight);
      pdf.save('id-card.pdf');
      
      toast({
        title: "Success!",
        description: "ID Card PDF has been downloaded",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Pop-up blocked. Please allow pop-ups for printing.",
        variant: "destructive"
      });
      return;
    }
    
    const cardElement = cardRef.current;
    if (!cardElement) return;
    
    // Create a data URL from the photo if it exists
    const photoDataUrl = formData.photo || '';
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print ID Card</title>
        <style>
          @page {
            size: 86mm 54mm landscape;
            margin: 0;
          }
          body, html {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f5f5f5;
          }
          .card-container {
            width: 85.6mm;
            height: 53.98mm;
            position: relative;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            overflow: hidden;
            page-break-inside: avoid;
          }
          .blue-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 30%;
            background: linear-gradient(to right, #4338ca, #3b82f6, #4338ca);
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0 1rem;
            box-sizing: border-box;
          }
          .blue-section img {
            height: 80%;
            object-fit: contain;
            margin-right: 12px;
          }
          .school-title {
            flex: 1;
            color: white;
          }
          .school-title div:first-child {
            font-weight: bold;
            font-size: 16px;
          }
          .school-title div:last-child {
            font-size: 10px;
            color: #e2e8f0;
          }
          .main-content {
            position: absolute;
            left: 0;
            top: 30%;
            height: 70%;
            width: 100%;
            padding: 1rem;
            background: linear-gradient(to bottom, #eef2ff, #eff6ff);
            box-sizing: border-box;
          }
          .photo-text-container {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
            box-sizing: border-box;
          }
          .text-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            margin-top: 16px;
          }
          .text-content div:first-child {
            margin-bottom: 16px;
          }
          .text-content div:nth-child(2) {
            margin-bottom: 12px;
          }
          .photo-container {
            width: 75px;
            height: 75px;
            margin-top: -12px;
            overflow: hidden;
            border: 2px solid #e0e7ff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            box-sizing: border-box;
          }
          .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(to right, #4338ca, #4f46e5);
            padding: 2px 0;
            text-align: center;
            box-sizing: border-box;
          }
          .footer div {
            color: white;
            font-size: 8px;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: white;
            }
            .card-container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body onload="setTimeout(function() { window.print(); window.setTimeout(function() { window.close(); }, 500); }, 300);">
        <div class="card-container">
          <div class="blue-section">
            <img src="/uploads/fc761e83-a4e9-4270-b545-4b32eee42a09.png" alt="Logo" />
            <div class="school-title">
              <div>Royal American School</div>
              <div>Tel: 025591000</div>
            </div>
          </div>
          <div class="main-content">
            <div class="photo-text-container">
              <div class="text-content">
                ${formData.fullName ? `<div style="font-weight: 600;">Name: ${formData.fullName}</div>` : ''}
                ${formData.employeeId ? `<div style="font-size: 12px; background-color: #4338ca; color: white; padding: 2px 12px; border-radius: 9999px; display: inline-block;">ID: ${formData.employeeId}</div>` : ''}
                ${formData.designation && formData.designation.trim() ? `<div style="font-size: 12px; font-style: italic;">Designation: ${formData.designation}</div>` : ''}
              </div>
              ${formData.photo ? `<div class="photo-container"><img src="${photoDataUrl}" alt="Employee" /></div>` : ''}
            </div>
          </div>
          <div class="footer">
            <div>© ${formData.year} Royal American School</div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">ID Card Generator</h1>
          <p className="text-slate-600 text-lg">Create professional ID cards with ease</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="p-6 shadow-xl bg-white/90 backdrop-blur-sm rounded-xl border-t border-blue-100">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-700 border-b pb-2 mb-4">Card Information</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 font-medium">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    placeholder="Enter full name"
                    className="border-slate-200 focus:border-blue-300 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-slate-700 font-medium">Employee ID</Label>
                  <Input 
                    id="employeeId" 
                    name="employeeId" 
                    value={formData.employeeId} 
                    onChange={handleInputChange} 
                    placeholder="Enter employee ID"
                    className="border-slate-200 focus:border-blue-300 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-slate-700 font-medium">Designation</Label>
                  <Input 
                    id="designation" 
                    name="designation" 
                    value={formData.designation} 
                    onChange={handleInputChange} 
                    placeholder="Enter designation"
                    className="border-slate-200 focus:border-blue-300 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-slate-700 font-medium">Year</Label>
                  <Input 
                    id="year" 
                    name="year" 
                    value={formData.year} 
                    onChange={handleInputChange} 
                    placeholder="Enter year"
                    className="border-slate-200 focus:border-blue-300 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo" className="text-slate-700 font-medium">Photo (Square image recommended)</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="photo" 
                      name="photo" 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="cursor-pointer border-slate-200 focus:border-blue-300 transition-all" 
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload photo"
                      className="hover:bg-slate-100"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-5">
                <Button onClick={downloadPDF} className="flex-1 bg-slate-800 hover:bg-slate-700 transition-all">
                  <Image className="h-4 w-4 mr-2" /> Download PDF
                </Button>
                <Button variant="outline" onClick={handlePrint} className="flex-1 border-slate-300 hover:bg-slate-100 transition-all">
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
              </div>
            </div>
          </Card>

          {/* Preview Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border-t border-blue-100">
            <h2 className="text-xl font-semibold text-slate-700 self-start mb-6">Preview</h2>
            <div ref={cardRef} className="relative bg-white shadow-lg transition-transform hover:scale-[1.02] duration-300 rounded-md" style={{
              width: '400px',
              height: '252px',
              aspectRatio: '1.586'
            }}>
              {/* Rest of the ID card remains the same */}
              {/* Blue Header - with enhanced gradient */}
              <div className="absolute top-0 left-0 w-full h-[30%] flex flex-row items-center px-6 bg-gradient-to-r from-indigo-800 via-blue-700 to-indigo-600">
                <img alt="School Logo" src="/uploads/fc761e83-a4e9-4270-b545-4b32eee42a09.png" className="h-4/5 object-contain mr-3" />
                <div className="flex-1">
                  <div className="font-bold text-lg text-white">Royal American School</div>
                  <div className="text-xs text-slate-200">Tel: 025591000</div>
                </div>
                <div className="text-right text-white">
                  {/* Empty div to maintain spacing */}
                </div>
              </div>

              {/* Main Content Area - with more consistent color scheme */}
              <div className="absolute left-0 top-[30%] h-[70%] w-full p-4 bg-gradient-to-b from-indigo-50 to-blue-50">
                {/* Top section with photo on left and name, ID to the right */}
                <div className="flex flex-row items-start">
                  {/* Photo on right side now, positioned higher up */}
                  <div className="flex flex-col flex-1 justify-start mt-4">
                    {/* Name text with added space below */}
                    {formData.fullName && (
                      <div className="font-semibold text-base text-slate-800 mb-4">Name: {formData.fullName}</div>
                    )}
                    
                    {/* ID with more space below */}
                    {formData.employeeId && (
                      <div className="text-sm bg-indigo-700 text-white px-3 py-1 rounded-full inline-block mb-3">
                        ID: {formData.employeeId}
                      </div>
                    )}
                    
                    {/* Designation text */}
                    {formData.designation && (
                      <div className="text-sm text-slate-600 italic">Designation: {formData.designation}</div>
                    )}
                  </div>
                  
                  {/* Photo on right side of text content */}
                  {formData.photo && (
                    <div className="w-[75px] h-[75px] overflow-hidden border-2 border-indigo-200 shadow-md ml-4 -mt-3">
                      <img src={formData.photo} alt="Employee" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                
                {/* Footer with year - enhanced colors */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-indigo-800 to-indigo-600 py-1 px-3">
                  <div className="text-xs text-white text-center">
                    © {formData.year} Royal American School
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
