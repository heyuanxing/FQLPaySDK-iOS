Pod::Spec.new do |s|
  s.name         = "FQLPaySDK"
  s.version      = "1.6.0.1"
  s.summary      = "乐卡支付SDK"
  s.homepage     = "https://github.com/FenqileAppTeam/FQLPaySDK-iOS"
  s.platform     = :ios, "8.0"
  s.author       = { "fql@fql.com" => "fql@fql.com" }
  s.source       = { :git => "https://github.com/heyuanxing/FQLPaySDK-iOS.git", :tag =>"1.6.0.1"}
  s.vendored_frameworks = 'FQLPaySDK/FQLPay.framework','FQLPaySDK/MGFaceIDBaseKit.framework','FQLPaySDK/MGFaceIDIDCardKernelKit.framework','FQLPaySDK/MGFaceIDIDCardKit.framework','FQLPaySDK/MGFaceIDLiveDetect.framework'
  s.requires_arc = true
  s.frameworks = 'CoreMotion','Contacts','AdSupport','CoreLocation','AddressBook','CoreTelephony','SystemConfiguration','CFNetwork','MobileCoreServices'
  s.libraries = 'resolv.9','stdc++','z'
  s.pod_target_xcconfig = { :CLANG_CXX_LANGUAGE_STANDARD => "c++11", :CLANG_CXX_LIBRARY => "libc++",'ARCHS[sdk=iphonesimulator*]' => '$(ARCHS_STANDARD_64_BIT)'}
  s.resource = 'FQLPaySDK/FQLPayResource.bundle','FQLPaySDK/MGFaceIDIDCardResouce.bundle','FQLPaySDK/MGFaceIDLiveCustomDetect.bundle'
  s.dependency  'AFNetworking'
  s.dependency  'YTKKeyValueStore', '~> 0.1.2'
  s.dependency  'MJExtension', '~> 3.1.0'
  s.dependency  'GZIP'
  s.dependency  'WCDB', '1.0.7.5'

end

