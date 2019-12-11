//
//  MGFaceIDIDCardViewController.h
//  MGFaceIDIDCardKit
//
//  Created by MegviiDev on 2018/12/28.
//  Copyright © 2018 Megvii. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MGFaceIDIDCardConfigItem.h"
#import "MGFaceIDIDCardPrivateConfig.h"

NS_ASSUME_NONNULL_BEGIN

@interface MGFaceIDIDCardViewController : UIViewController

/**
 拍摄模式，横竖屏方向
 */
@property (nonatomic, assign) MGFaceIDIDCardScreenOrientation screenOrientation;

/**
 拍摄面，身份证人像面或国徽面
 */
@property (nonatomic, assign) MGFaceIDIDCardShootPage shootPage;

/**
 额外信息，当前为nil
 */
@property (nonatomic, strong) NSDictionary* extraDict;

/**
 检测管理器y阈值设定
 */
@property (nonatomic, strong) MGFaceIDIDCardConfigItem* configItem;

/**
 检测结果返回Block
 */
@property (nonatomic, copy) FaceIDIDCardDetectResultBlock resultBlock;

#pragma mark - 分期乐定制
// 自动识别正反面
@property (nonatomic, assign) BOOL fql_is_auto_detect_front_opposite;

// 重新布局UI
- (void)fql_resetSubviews;
// 启动识别
- (void)fql_startIDCardDetect;
// 继续识别反面操作
- (void)fql_continueDetectOppositeHandle;
// 关闭Ocr VC
- (void)fql_closeOcrViewController;

@end

NS_ASSUME_NONNULL_END
