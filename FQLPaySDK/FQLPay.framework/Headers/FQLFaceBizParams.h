//
//  FQLFaceBizParams.h
//  FQLPay
//
//  Created by iwar on 2020/9/8.
//  Copyright © 2020 FQLPay. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface FQLFaceBizParams : NSObject

@property (nonatomic, copy) NSString*  openId;    // 公开标识，用于关联用户
@property (nonatomic, copy) NSString*  clientId;  // 客户端标识，用于分期乐识别商户来源
@property (nonatomic, copy) NSString*  orderId;   // 可选项，订单标识，可与刷脸做关联
@property (nonatomic, copy) NSDictionary*  extra; // 扩展

@end

