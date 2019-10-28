Pod::Spec.new do |s|
  s.name         = "FQLPaySDK"
  s.version      = "1.4.0"
  s.summary      = "乐卡支付SDK"
  s.homepage     = "https://github.com/FenqileAppTeam/FQLPaySDK-iOS"
  s.author       = { "treewang@lexin.com" => "treewang@lexin.com" }
  s.platform     = :ios, "8.0"
  s.source       = { :git => "https://github.com/FenqileAppTeam/FQLPaySDK-iOS.git", :tag =>"1.4.0"}
  s.vendored_frameworks = 'FQLPaySDK/FQLPay.framework'
  s.requires_arc = true
  s.frameworks = 'CoreMotion','Contacts','AdSupport','CoreLocation','AddressBook','CoreTelephony','SystemConfiguration','CFNetwork','MobileCoreServices'
  s.libraries = 'resolv.9','stdc++','z'
  valid_archs = ['armv7s','arm64','x86_64','arm64e',]
  s.xcconfig = {
    'VALID_ARCHS' =>  valid_archs.join(' '),
  }
  s.pod_target_xcconfig = { :CLANG_CXX_LANGUAGE_STANDARD => "c++11", :CLANG_CXX_LIBRARY => "libc++",'ARCHS[sdk=iphonesimulator*]' => '$(ARCHS_STANDARD_64_BIT)'}
  s.resource = 'FQLPaySDK/FQLPayResource.bundle'
  s.dependency  'AFNetworking'
  s.dependency  'YTKKeyValueStore', '~> 0.1.2'
  s.dependency  'MJExtension', '~> 3.1.0'
  s.dependency  'GZIP'

end

