export default function Home() {
  const LogoMark = ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 16.5l5-5 3.5 3.5L19 9.5" />
      <path d="M19 9.5V14" />
      <path d="M6 19h12" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white font-[var(--font-vazir)]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-emerald-600/20">
              <LogoMark className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-800">برس</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-stone-600">
            <a href="#features" className="hover:text-stone-900 transition-colors">ویژگی‌ها</a>
            <a href="#how" className="hover:text-stone-900 transition-colors">نحوه کار</a>
            <a href="#faq" className="hover:text-stone-900 transition-colors">سوالات متداول</a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/auth/login"
              className="text-stone-600 hover:text-stone-900 transition-colors font-medium"
            >
              ورود
            </a>
            <a
              href="/auth/signup"
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all font-medium shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30"
            >
              شروع رایگان
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 pt-16 pb-24 max-w-7xl relative">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              رهگیری بازار و پرتفوی با برس
            </div>
          </div>
          
          {/* Main Heading */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-stone-900 leading-tight mb-6">
              بازار را دقیق‌تر
              <br />
              <span className="text-emerald-600">رهگیری کنید</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone-500 leading-relaxed max-w-2xl mx-auto mb-4">
              سود و ضرر دارایی‌هایت را لحظه‌ای و شفاف ببین.
              بدان امروز روی دلار، طلا و بیت‌کوین چقدر جلو یا عقبی.
            </p>
            <p className="text-lg text-stone-400">
              قیمت‌ها، پرتفوی و واچ‌لیست در یک داشبورد ساده.
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center mb-16">
            <a
              href="/auth/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all text-lg font-medium shadow-xl shadow-stone-900/20"
            >
              شروع رایگان
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          
          {/* Hero Visual with Floating Cards */}
          <div className="relative max-w-5xl mx-auto">
            {/* Main Dashboard Card */}
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl shadow-stone-200/50 border border-stone-200/50 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-emerald-700">به‌روزرسانی زنده</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "دلار آمریکا", value: "۶۷٬۵۰۰", change: "+۲٫۳٪", up: true },
                  { name: "یورو", value: "۷۲٬۸۰۰", change: "+۱٫۸٪", up: true },
                  { name: "طلا ۱۸ عیار", value: "۵٬۲۳۰٬۰۰۰", change: "−۰٫۵٪", up: false },
                  { name: "بیت‌کوین", value: "۹۸٬۵۰۰ دلار", change: "+۴٫۲٪", up: true },
                ].map((asset) => (
                  <div
                    key={asset.name}
                    className="bg-stone-50 rounded-2xl p-4 hover:bg-stone-100 transition-colors"
                  >
                    <div className="text-sm text-stone-500 mb-1">{asset.name}</div>
                    <div className="text-xl md:text-2xl font-bold text-stone-900 mb-1">{asset.value}</div>
                    <div className={`text-sm font-medium ${asset.up ? "text-emerald-600" : "text-red-500"}`}>
                      {asset.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Floating Card - Left */}
            <div className="absolute -left-4 md:-left-16 top-1/4 z-20 bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-4 w-48 hidden md:block transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-lg">۴٫۲٪</div>
                  <div className="text-xs text-stone-500">رشد هفتگی</div>
                </div>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Floating Card - Right Top */}
            <div className="absolute -right-4 md:-right-12 top-8 z-20 bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-4 hidden md:block transform hover:scale-105 transition-transform">
              <div className="text-xs text-stone-500 mb-2">نمودار هفتگی</div>
              <div className="flex items-end gap-1 h-12">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-4 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Floating Card - Right Bottom */}
            <div className="absolute -right-4 md:-right-8 bottom-8 z-20 bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-4 hidden md:block transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-stone-900 text-sm">هشدار فعال شد</div>
                  <div className="text-xs text-stone-500">دلار به ۶۸٬۰۰۰ رسید</div>
                </div>
              </div>
            </div>
            
            {/* Floating Card - Bottom Left */}
            <div className="absolute -left-4 md:left-8 -bottom-4 z-20 bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-4 hidden md:block transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm">
                  <div className="font-bold text-emerald-600">+۱۲٫۵٪</div>
                  <div className="text-stone-500">سود این ماه</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Why This Tool - Pain Points */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-center text-lg font-semibold text-stone-700 mb-6">چرا این ابزار؟</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 bg-white/60 backdrop-blur rounded-xl p-4 border border-stone-200/50">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-stone-600">قیمت‌ها پراکنده‌ان و باید ۱۰ تا سایت چک کنی</p>
              </div>
              <div className="flex items-start gap-3 bg-white/60 backdrop-blur rounded-xl p-4 border border-stone-200/50">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-stone-600">سود و ضرر پرتفوی معلوم نیست، همش ذهنی حساب می‌کنی</p>
              </div>
              <div className="flex items-start gap-3 bg-white/60 backdrop-blur rounded-xl p-4 border border-stone-200/50">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-stone-600">تبدیل دلار به تومان و طلا همیشه گیج‌کننده‌ست</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-xl md:text-2xl lg:text-3xl text-stone-700 leading-relaxed max-w-4xl mx-auto">
              همه دارایی‌هات رو <span className="text-stone-900 font-semibold">یه‌جا</span> ببین،
              سود و ضررت رو <span className="text-emerald-600 font-semibold">لحظه‌ای</span> بدون
              و با <span className="text-stone-900 font-semibold">اعتماد بیشتر</span> تصمیم بگیر.
            </p>
          </div>
          
          {/* Mini Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "سود و ضرر شفاف", icon: "chart" },
              { title: "قیمت‌های لحظه‌ای", icon: "bolt" },
              { title: "تبدیل خودکار ارز", icon: "refresh" },
              { title: "پرتفوی و واچ‌لیست", icon: "folder" },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-stone-100 transition-all">
                <div className="text-emerald-500 mb-3">
                  {item.icon === "chart" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                  {item.icon === "bolt" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {item.icon === "refresh" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {item.icon === "folder" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="text-stone-700 font-medium text-sm">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="bg-stone-50 py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-4">
            <span className="text-xs font-medium text-stone-400 tracking-widest uppercase">امکانات</span>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
              ابزارهای ساده برای
              <br />
              <span className="text-stone-600">مدیریت بهتر دارایی</span>
            </h2>
          </div>
          
          {/* Product Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              { name: "پرتفوی", active: true },
              { name: "واچ‌لیست", active: false },
              { name: "هشدار", active: false },
              { name: "تحلیل", active: false },
            ].map((tab, i) => (
              <button
                key={i}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  tab.active 
                    ? "bg-stone-900 text-white" 
                    : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          
          {/* Product Cards */}
          <div className="space-y-8">
            {/* Card 1 - Purple/Lavender */}
            <div className="bg-gradient-to-br from-violet-200 via-violet-100 to-purple-100 rounded-3xl p-8 md:p-12 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <span className="text-xs font-medium text-violet-600 tracking-widest uppercase">۰۱ پرتفوی</span>
                  <h3 className="text-3xl md:text-4xl font-bold text-stone-900">
                    مدیریت هوشمند
                    <br />
                    پرتفوی شما
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    همه دارایی‌ها را در یک داشبورد ببینید، ترکیب پرتفوی را بررسی کنید و گزارش‌های قابل‌فهم داشته باشید.
                  </p>
                  <a href="#" className="inline-flex items-center gap-2 text-stone-900 font-medium hover:gap-3 transition-all">
                    مشاهده جزئیات
                    <svg className="w-4 h-4 -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">پرتفوی من</div>
                          <div className="text-xs text-stone-500">۴ دارایی</div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-bold text-emerald-600">+۸٫۳٪</div>
                        <div className="text-xs text-stone-500">سود کل</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: "دلار", percent: 40, color: "bg-emerald-500", pnl: "+۱۲٪" },
                        { name: "طلا", percent: 30, color: "bg-amber-500", pnl: "+۵٪" },
                        { name: "بیت‌کوین", percent: 20, color: "bg-orange-500", pnl: "+۱۸٪" },
                        { name: "یورو", percent: 10, color: "bg-blue-500", pnl: "-۲٪" },
                      ].map((asset, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-stone-500 w-14">{asset.name}</span>
                          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div className={`h-full ${asset.color} rounded-full`} style={{ width: `${asset.percent}%` }}></div>
                          </div>
                          <span className={`text-xs font-medium w-10 text-left ${asset.pnl.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{asset.pnl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 2 - Green */}
            <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-800 rounded-3xl p-8 md:p-12 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <span className="text-xs font-medium text-emerald-300 tracking-widest uppercase">۰۲ تحلیل</span>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">
                    تحلیل سریع
                    <br />
                    و رصد روند
                  </h3>
                  <p className="text-emerald-100 leading-relaxed">
                    نمودارهای کاربردی، مقایسه بازه‌های زمانی و هشدارهای قابل‌تنظیم برای تصمیم‌گیری دقیق‌تر.
                  </p>
                  <a href="#" className="inline-flex items-center gap-2 text-white font-medium hover:gap-3 transition-all">
                    مشاهده ابزارها
                    <svg className="w-4 h-4 -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-medium">نمودار دلار</span>
                      <span className="text-emerald-300 text-sm">فعال</span>
                    </div>
                    <div className="relative h-32">
                      <svg className="w-full h-full" viewBox="0 0 200 80">
                        <path
                          d="M0,60 Q30,40 50,45 T100,30 T150,35 T200,20"
                          fill="none"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="2"
                        />
                        <path
                          d="M0,60 Q30,40 50,45 T100,30 T150,35 T200,20"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-200 mt-2">
                      <span>۱ هفته پیش</span>
                      <span>امروز</span>
                    </div>
                  </div>
                  {/* Floating notification */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 transform hover:scale-105 transition-transform">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="text-xs">
                        <div className="font-medium text-stone-900">هشدار فعال</div>
                        <div className="text-stone-500">۶۸٬۰۰۰ تومان</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-white py-16 border-b border-stone-100">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            {[
              { value: "۲۴/۷", label: "به‌روزرسانی لحظه‌ای قیمت‌ها" },
              { value: "۵۰+", label: "دارایی قابل رهگیری" },
              { value: "رایگان", label: "شروع بدون هزینه" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-stone-900 mb-1">{stat.value}</div>
                <div className="text-sm text-stone-500">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Testimonials */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-stone-700 mb-2">چرا کاربران برس رو دوست دارن؟</h3>
            <p className="text-sm text-stone-500">تجربه واقعی کاربران از استفاده روزانه</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "امیرحسین نوری",
                role: "سرمایه‌گذار بازار ارز",
                text: "قبلاً برای چک کردن قیمت دلار و طلا باید ۵-۶ تا سایت مختلف می‌رفتم. الان همه چیز یکجاست و می‌دونم دقیقاً چقدر سود یا ضرر کردم.",
                avatar: "ا"
              },
              {
                name: "نگار صالحی",
                role: "تریدر رمزارز",
                text: "ویژگی محاسبه خودکار سود و ضرر عالیه! دیگه لازم نیست با اکسل کلنجار برم. همه چیز شفاف و لحظه‌ای نشون داده می‌شه.",
                avatar: "ن"
              },
              {
                name: "رضا کریمی",
                role: "کارمند و سرمایه‌گذار",
                text: "رابط کاربری فارسی و ساده‌اش خیلی خوبه. تبدیل ارزها به تومان هم خودکاره و نیازی نیست دستی حساب کنم.",
                avatar: "ر"
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-lg hover:shadow-stone-100 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">{testimonial.name}</div>
                    <div className="text-xs text-stone-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">"{testimonial.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Portfolio Assistant Section */}
      <section className="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 py-24 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20">
                <svg className="w-5 h-5 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm text-violet-200 font-medium">قدرت هوش مصنوعی</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                از داده‌هات
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-pink-300">سوال بپرس</span>
              </h2>
              
              <p className="text-lg text-violet-100 leading-relaxed">
                با زبان ساده از پرتفوی و دارایی‌هات سوال بپرس. 
                دستیار هوشمند برس داده‌های تو رو تحلیل می‌کنه و جواب می‌ده.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: "تحلیل پرتفوی", desc: "ببین ترکیب دارایی‌هات چطوره" },
                  { title: "محاسبه سود و ضرر", desc: "سوال کن چقدر سود یا ضرر کردی" },
                  { title: "مقایسه دارایی‌ها", desc: "عملکرد دارایی‌های مختلف رو مقایسه کن" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-sm text-violet-200">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <a
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-900 rounded-full hover:bg-violet-50 transition-all font-medium shadow-lg"
                >
                  امتحان کنید
                  <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* AI Chat Preview */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-pink-400 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white">دستیار هوشمند برس</div>
                    <div className="text-xs text-violet-300">آنلاین</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* User message */}
                  <div className="flex justify-start">
                    <div className="bg-white/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="text-white text-sm">این ماه روی دلار چقدر سود کردم؟</p>
                    </div>
                  </div>
                  
                  {/* AI response */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] border border-violet-400/30">
                      <p className="text-white text-sm leading-relaxed">
                        بر اساس داده‌های پرتفوی شما، این ماه روی دلار <span className="text-emerald-300 font-medium">۸.۲٪ سود</span> داشتید. 
                        ارزش دلارهای شما از ۱۵ میلیون به ۱۶.۲ میلیون تومان رسیده.
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["سود کل پرتفوی؟", "مقایسه با طلا", "نمودار ماهانه"].map((action, i) => (
                      <button key={i} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white border border-white/20 transition-colors">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-white">به زودی</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section - Improved */}
      <section className="bg-stone-900">
        {/* Header */}
        <div className="container mx-auto px-6 max-w-7xl pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs font-medium text-stone-500 tracking-widest uppercase mb-4 block">تکنولوژی</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                ساخته شده با
                <br />
                <span className="text-emerald-400">بهترین ابزارها</span>
              </h2>
              <p className="text-stone-400 mt-4 leading-relaxed">
                از معتبرترین منابع داده و مدرن‌ترین تکنولوژی‌ها برای ارائه تجربه‌ای سریع و قابل اعتماد استفاده می‌کنیم.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-stone-500 tracking-widest uppercase mb-6 block">تضمین کیفیت</span>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 border border-stone-700 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-xs text-stone-500">امنیت داده</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 border border-stone-700 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-xs text-stone-500">سرعت بالا</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Technology Stats Grid */}
        <div className="border-t border-stone-800">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {[
                { value: "<۱۰۰", label: "میلی‌ثانیه", sublabel: "زمان پاسخ" },
                { value: "۹۹.۹٪", label: "آپتایم", sublabel: "قابلیت اطمینان" },
                { value: "API", label: "منابع معتبر", sublabel: "داده‌های زنده" },
                { value: "SSL", label: "رمزنگاری", sublabel: "امنیت داده" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={`py-12 px-6 ${i !== 3 ? 'border-l border-stone-800' : ''}`}
                >
                  <div className="text-emerald-400 text-xs mb-3 font-medium">{stat.sublabel}</div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-1 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-stone-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
              ابزارهای حرفه‌ای برای سرمایه‌گذاران
            </h2>
            <p className="text-xl text-stone-500 max-w-3xl mx-auto">
              همه‌چیز برای رهگیری دقیق و مدیریت بهتر پرتفوی در یک پلتفرم
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "رهگیری بلادرنگ",
                desc: "قیمت‌های لحظه‌ای دلار، طلا، ETF و رمزارزها با به‌روزرسانی دائمی",
                iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              },
              {
                title: "مدیریت پرتفوی",
                desc: "پرتفوی شخصی بسازید، سرمایه‌گذاری‌ها را دسته‌بندی کنید و سود/زیان ببینید",
                iconPath: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
              },
              {
                title: "تحلیل و نمودار",
                desc: "نمودارهای پیشرفته، اندیکاتورهای تکنیکال، و تحلیل روند",
                iconPath: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
              },
              {
                title: "هشدار قیمت",
                desc: "هشدار سفارشی برای تغییرات قیمت و رسیدن به اهداف تعیین شده",
                iconPath: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
              },
              {
                title: "دسترسی همه‌جا",
                desc: "موبایل، تبلت و دسکتاپ—پرتفوی شما همیشه در دسترس",
                iconPath: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
              },
              {
                title: "امنیت و شفافیت",
                desc: "داده‌های رمزنگاری شده، منابع معتبر، و شفافیت کامل",
                iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-stone-50 border border-stone-200 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-stone-200/50 hover:border-stone-300 transition-all"
              >
                <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.iconPath} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-stone-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="bg-stone-50 py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
              در سه قدم شروع کنید
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: "۱",
                title: "ثبت‌نام رایگان",
                desc: "حساب کاربری خود را در کمتر از یک دقیقه بسازید",
              },
              {
                num: "۲",
                title: "پرتفوی بسازید",
                desc: "دارایی‌های خود را اضافه کنید و واچ‌لیست شخصی بسازید",
              },
              {
                num: "۳",
                title: "رهگیری کنید",
                desc: "قیمت‌ها را دنبال کنید، تحلیل کنید، و تصمیم بگیرید",
              },
            ].map((step) => (
              <div key={step.num} className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-stone-900 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold text-stone-900">{step.title}</h3>
                <p className="text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-stone-50 py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
              سوالات متداول
            </h2>
            <p className="text-xl text-stone-500">
              پاسخ سوالات رایج کاربران
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "آیا استفاده از برس رایگان است؟",
                a: "بله، شروع کار با برس کاملاً رایگان است. برای کاربران حرفه‌ای امکانات ویژه‌ای در آینده اضافه خواهد شد."
              },
              {
                q: "قیمت‌ها از کجا می‌آیند؟",
                a: "قیمت‌ها از معتبرترین منابع بازار ایران و جهان دریافت می‌شوند و به صورت لحظه‌ای به‌روزرسانی می‌شوند."
              },
              {
                q: "آیا اطلاعات من امن است؟",
                a: "بله، تمام داده‌ها با استانداردهای امنیتی بالا رمزنگاری می‌شوند و هیچ اطلاعات حساسی با شخص ثالث به اشتراک گذاشته نمی‌شود."
              },
              {
                q: "آیا می‌توانم پرتفوی واقعی خود را وارد کنم؟",
                a: "بله، می‌توانید دارایی‌های خود را به صورت دستی وارد کنید و سود و زیان را به صورت لحظه‌ای مشاهده کنید."
              },
              {
                q: "آیا اپلیکیشن موبایل دارید؟",
                a: "در حال حاضر برس به صورت وب‌اپلیکیشن کار می‌کند که روی موبایل هم به خوبی نمایش داده می‌شود. اپلیکیشن موبایل در برنامه‌های آینده است."
              },
              {
                q: "چه دارایی‌هایی را می‌توان رهگیری کرد؟",
                a: "دلار، یورو، پوند، طلای ۱۸ عیار، سکه، بیت‌کوین، اتریوم و ده‌ها رمزارز دیگر قابل رهگیری هستند."
              },
            ].map((faq, i) => (
              <details 
                key={i} 
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-stone-50 transition-colors">
                  <span className="font-medium text-stone-900 text-right">{faq.q}</span>
                  <svg className="w-5 h-5 text-stone-400 group-open:rotate-180 transition-transform flex-shrink-0 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-500 py-20">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            همین امروز رهگیری بازار را شروع کنید
          </h2>
          <p className="text-xl text-emerald-50 mb-8">
            رایگان شروع کنید—بدون کارت اعتباری، بدون تعهد
          </p>
          <a
            href="/auth/signup"
            className="inline-block px-10 py-5 bg-white text-emerald-600 rounded-full hover:bg-stone-50 transition-colors text-lg font-bold shadow-2xl"
          >
            ثبت‌نام رایگان
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-white text-xl">
                  <LogoMark className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">برس</span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">
                پلتفرم رهگیری بازار و مدیریت پرتفوی برای کاربران فارسی‌زبان
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">محصول</h4>
              <ul className="space-y-2 text-stone-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">ویژگی‌ها</a></li>
                <li><a href="#how" className="hover:text-white transition-colors">نحوه کار</a></li>
                <li><a href="#" className="hover:text-white transition-colors">قیمت‌گذاری</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">پشتیبانی</h4>
              <ul className="space-y-2 text-stone-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">راهنما</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سوالات متداول</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تماس با ما</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">قانونی</h4>
              <ul className="space-y-2 text-stone-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">حریم خصوصی</a></li>
                <li><a href="#" className="hover:text-white transition-colors">شرایط استفاده</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
            <p>© {new Date().getFullYear()} برس — همه حقوق محفوظ است</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
