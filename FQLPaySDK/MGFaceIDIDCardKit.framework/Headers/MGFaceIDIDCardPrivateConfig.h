//
//  MGFaceIDIDCardPrivateConfig.h
//  MGFaceIDIDCardKit
//
//  Created by MegviiDev on 2018/12/28.
//  Copyright © 2018 Megvii. All rights reserved.
//

#ifndef MGFaceIDIDCardPrivateConfig_h
#define MGFaceIDIDCardPrivateConfig_h

#import "MGFaceIDIDCardConfig.h"

#define kMGFaceIDIDCardModelFile  @"MGFaceIDIDCard_model"

#define kIDCardWHScale (1.0 * 85.6 /  54)
#define kCameraWHScale (1.0 * 9.0 / 16.0)
#define kIDCardVerticalMaxWidthScale (0.85f)
#define kIDCardLandscapeMaxHeightScale (0.70f)

/* 判断是否为 iPhone X */
#define IS_IPHONE_X  (kIsIPhoneXR || kIsIPhoneX || kIsIPhoneXMax)
#define kIsIPhoneXR ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(828, 1792), [[UIScreen mainScreen] currentMode].size) : NO)
#define kIsIPhoneX ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(1125, 2436), [[UIScreen mainScreen] currentMode].size) : NO)
#define kIsIPhoneXMax ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? CGSizeEqualToSize(CGSizeMake(1242, 2688), [[UIScreen mainScreen] currentMode].size) : NO)

/* rgb颜色转换（16进制->10进制）*/
#define FaceIDIDCardColorWithRGB(rgbValue) [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:1.0]

#endif /* MGFaceIDIDCardPrivateConfig_h */
