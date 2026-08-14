import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ICapturePayment, YooCheckout } from '@a2seven/yoo-checkout';
import { OrderDto } from './dto/order.dto';
import { PaymentStatusDto } from './dto/payment-status.dto';
import { EnumOrderStatus } from 'generated/prisma/enums';

const checkout = new YooCheckout({
    shopId: process.env['YOOKASSA_SHOP_ID'] as string,
    secretKey: process.env['YOOKASSA_SECRET_KEY'] as string,
});

@Injectable()
export class OrderService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async createPayment(dto: OrderDto, userId: string) {
        const orderItems = dto.items.map(item => ({
            product: {
                connect: {
                    id: item.productId,
                },
            },
            quantity: item.quantity,
            price: item.price,
            store: {
                connect: {
                    id: item.storeId,
                },
            },
        }));

        const total = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        const order = await this.prisma.order.create({
            data: {
                status: dto.status,
                items: {
                    create: orderItems,
                },
                total,
                user: { connect: { id: userId } },
            },
        });

        const payment = await checkout.createPayment({
            amount: {
                value: total.toFixed(2),
                currency: 'UAH',
            },
            payment_method_data: {
                type: 'bank_card',
            },
            confirmation: {
                type: 'redirect',
                return_url: `${process.env['CLIENT_URL']}/thanks`,
            },
            metadata: {
                orderId: order.id,
            },
            description: `Order payment for order ${order.id}`,
        });

        return payment;
    }

    async updateStatus(dto: PaymentStatusDto) {
        if (dto.event === 'payment.waiting_for_capture') {
            const capturePayment: ICapturePayment = {
                amount: {
                    value: dto.object.amount.value,
                    currency: dto.object.amount.currency,
                }
            }

            return checkout.capturePayment(dto.object.id, capturePayment);
        }

        if (dto.event === 'payment.succeeded') {
            const orderId = dto.object.description.split('#')[1];

            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: EnumOrderStatus.PAYED },
            });

            return true;
        }

        return true;
    }

}
