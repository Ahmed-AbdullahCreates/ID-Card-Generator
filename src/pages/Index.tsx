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
      // Enhanced html2canvas options for better rendering quality and accuracy
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Higher scale for better quality
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        logging: false,
        imageTimeout: 0, // No timeout for images
        onclone: (clonedDoc) => {
          // Ensure fonts are loaded before rendering
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          return new Promise(resolve => setTimeout(resolve, 100));
        }
      });

      // Card dimensions in mm (credit card proportion)
      const cardWidth = 85.60;
      const cardHeight = 53.98;
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [cardWidth, cardHeight],
        compress: false
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
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
            size: 85.6mm 53.98mm landscape;
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
            padding: 0 1.5rem;
            box-sizing: border-box;
          }
          .blue-section img {
            height: 80%;
            object-fit: contain;
            margin-right: 0.75rem;
          }
          .school-info {
            flex: 1;
            color: white;
          }
          .school-info .name {
            font-weight: bold;
            font-size: 16px;
            line-height: 1.2;
          }
          .school-info .tel {
            font-size: 10px;
            color: #e2e8f0;
            margin-top: 2px;
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
          .content-row {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            width: 100%;
          }
          .photo-container {
            width: 75px;
            height: 75px;
            margin-top: -12px;
            margin-right: 1rem;
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
          .text-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            margin-top: 16px;
          }
          .name-text {
            font-weight: 600;
            font-size: 14px;
            color: #1e293b;
            margin-bottom: 16px;
          }
          .id-text {
            font-size: 12px;
            color: #334155;
            margin-bottom: 20px;
          }
          .designation-text {
            font-size: 12px;
            font-style: italic;
            color: #475569;
            margin-top: 4px;
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
          }
        </style>
      </head>
      <body onload="setTimeout(function() { window.print(); window.setTimeout(function() { window.close(); }, 500); }, 300);">
        <div class="card-container">
          <div class="blue-section">
            <img src="/uploads/fc761e83-a4e9-4270-b545-4b32eee42a09.png" alt="Logo" />
            <div class="school-info">
              <div class="name">Royal American School</div>
              <div class="tel">Tel: 025591000</div>
            </div>
          </div>
          <div class="main-content">
            <div class="content-row">
              ${formData.photo ? `<div class="photo-container"><img src="${formData.photo}" alt="Employee" /></div>` : ''}
              <div class="text-container">
                ${formData.fullName ? `<div class="name-text">Name: ${formData.fullName}</div>` : ''}
                ${formData.employeeId ? `<div class="id-text">ID: ${formData.employeeId}</div>` : ''}
                ${formData.designation && formData.designation.trim() ? `<div class="designation-text">Designation: ${formData.designation}</div>` : ''}
              </div>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 p-4 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-800 mb-3 drop-shadow-sm">ID Card Generator</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">Create professional ID cards for your staff with ease. Fill in the details, add a photo, and get print-ready cards instantly.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          {/* Form Section */}
          <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm rounded-xl border-t border-blue-100 hover:shadow-blue-100/20 transition-all">
            <div className="space-y-7">
              <div className="flex items-center space-x-2 border-b border-indigo-100 pb-4 mb-2">
                <div className="p-2 rounded-lg bg-indigo-50">
                  <Image className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-indigo-800">Card Information</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 font-medium flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                    Full Name
                  </Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    placeholder="Enter full name"
                    className="border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-slate-700 font-medium flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                    Employee ID
                  </Label>
                  <Input 
                    id="employeeId" 
                    name="employeeId" 
                    value={formData.employeeId} 
                    onChange={handleInputChange} 
                    placeholder="Enter employee ID"
                    className="border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-slate-700 font-medium flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                    Designation
                  </Label>
                  <Input 
                    id="designation" 
                    name="designation" 
                    value={formData.designation} 
                    onChange={handleInputChange} 
                    placeholder="Enter designation"
                    className="border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-slate-700 font-medium flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                    Year
                  </Label>
                  <Input 
                    id="year" 
                    name="year" 
                    value={formData.year} 
                    onChange={handleInputChange} 
                    placeholder="Enter year"
                    className="border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo" className="text-slate-700 font-medium flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                    Photo (Square image recommended)
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="photo" 
                      name="photo" 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="cursor-pointer border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all" 
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload photo"
                      className="hover:bg-indigo-50 border-indigo-200"
                    >
                      <Image className="h-4 w-4 text-indigo-600" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <Button 
                  onClick={downloadPDF} 
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Image className="h-4 w-4 mr-2" /> Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handlePrint} 
                  className="flex-1 border-indigo-200 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 transition-all duration-200 font-medium"
                >
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
              </div>
            </div>
          </Card>

          {/* Preview Section */}
          <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm rounded-xl border-t border-blue-100 hover:shadow-blue-100/20 transition-all">
            <div className="space-y-7">
              <div className="flex items-center space-x-2 border-b border-indigo-100 pb-4 mb-2">
                <div className="p-2 rounded-lg bg-indigo-50">
                  <Printer className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-indigo-800">Preview</h2>
              </div>
              
              <div className="flex justify-center items-center">
                <div className="relative">
                  {/* Card shadow effect */}
                  <div className="absolute inset-0 -bottom-4 -right-4 bg-gradient-to-br from-indigo-200 to-blue-300 rounded-lg opacity-30 blur-xl"></div>
                  
                  {/* Card preview */}
                  <div ref={cardRef} className="relative bg-white transition-transform hover:scale-[1.02] duration-300 z-10" style={{
                    width: '400px',
                    height: '252px',
                    aspectRatio: '1.586'
                  }}>
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
                        {/* Photo on left side as square */}
                        {formData.photo && (
                          <div className="w-[75px] h-[75px] overflow-hidden border-2 border-indigo-200 shadow-md mr-4 -mt-3">
                            <img src={formData.photo} alt="Employee" className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        {/* Text content positioned to the right of the photo */}
                        <div className="flex flex-col flex-1 justify-start mt-4">
                          {/* Name text with added space below */}
                          {formData.fullName && (
                            <div className="font-semibold text-base text-slate-800 mb-4">Name: {formData.fullName}</div>
                          )}
                          
                          {/* ID with more space below - removed background highlight */}
                          {formData.employeeId && (
                            <div className="text-sm text-slate-700 inline-block mb-5">
                              ID: {formData.employeeId}
                            </div>
                          )}
                          
                          {/* Designation text - with increased space above */}
                          {formData.designation && (
                            <div className="text-sm text-slate-600 italic mt-1">Designation: {formData.designation}</div>
                          )}
                        </div>
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
          </Card>
        </div>
      </div>
      
      {/* Website Footer */}
      {/* <footer className="mt-16 border-t border-indigo-100 pt-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="D:\Work\work\staff card genrator\card-craft-previewer-main\src\uploads\logo.png" alt="Logo" className="h-8 w-auto mr-2" />
              <span className="text-indigo-800 font-semibold">Royal American School</span>
            </div>
            <div className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Royal American School. All rights reserved.
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default Index;
