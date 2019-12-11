//
//  FQLPayManager.h
//  FQLPay
//
//  Created by swinwang on 2018/2/22.
//  Copyright © 2018年 FQLPay. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, FQLPayResultCode) {
    FQLPayResultCode_Success = 0, // 支付成功
    FQLPayResultCode_Failed = -1, // 支付失败
    FQLPayResultCode_Cancel = -2  // 取消支付
};

@protocol FQLPayProtocolDelegate <NSObject>

@required
/**
 FQLPaySDK成功/失败回调代理函数

 @param retCode 错误码
 @param retInfo 错误信息
 @param attachDict 附加信息
 */
- (void)fqlPayResultWithRetCode:(NSString *)retCode retInfo:(NSString *)retInfo attachDict:(NSDictionary *)attachDict;

/**
 成功打开支付页面
 */
- (void)onOpenSuccess;


@optional
/**
 YES：使用WKWebView,NO：使用UIWebVIew
 默认YES
 */
- (BOOL)useWKWebView;

@end


@interface FQLPayManager : NSObject


/**
 支付SDK代理
 */
@property (nonatomic, weak) id<FQLPayProtocolDelegate> delegate;

/**
 获取应用程序名称
 
 @return clientId 应用程序名称
 */
+ (NSString *)getClientId;

/**
 分期乐信用支付sdk版本

 @return 版本号
 */
+ (NSString *)fqlPaySDKVersion;


//实例化对象
+ (instancetype)shareInstance;

/**
 初始化SDK
 
 @param clientId clientId 应用程序名称
 @param debugEnable 是否开启调试模式
 */
- (void)initFQLPaySDKWithClientId:(NSString *)clientId debugEnable:(BOOL)debugEnable;

/**
 调起支付
 
 @param redirectUri 回调地址（订单相关页面）
 @param attach 渠道业务目前包含以下字段（agent、_CTAG、phone、btn_color、channel），后续扩展
 @param extendDict 扩展参数（naviBgColor：包含导航栏背景颜色（如#ff0000））
 @param targetVC 推出页面VC
 @param delegate 回调代理
 */
- (void)doFqlPayWithRedirectUri:(NSString *)redirectUri attach:(NSDictionary *)attach extendDict:(NSDictionary *)extendDict targetVC:(UIViewController *)targetVC delegate:(id<FQLPayProtocolDelegate>)delegate;

/**
 * FQLPaySDK退出登录，SDK内的页面会保存SDK相关的登录态，在宿主App退出登录时可以调用该API退出SDK的登录态
 */
- (void)paySDKLogOut;


/**
 判断是否为分期乐用户

 @return YES 为是，NO 为不是
 */
- (BOOL)isFqlUser;


/**
 处理从分期乐APP调整过来的openurl

 @param urlStr 分期乐APP跳转过来的openurl
 */
- (void)handleFqlPayOpenUrlStr:(NSString *)urlStr;




//用于模拟SDK Crash
- (void)ocException;

@end
