def calculate_price(
    bin_price,
    waste_charge,
    delivery_charge,
    hire_weeks, 
    discount
):
    
    extension_charge = 0

    if hire_weeks == 2:
        extension_charge = 40

    elif hire_weeks == 3:
        extension_charge = 80

    total = (
        bin_price +
        waste_charge +
        delivery_charge +
        extension_charge - 
        discount
    )

    return {
        "extension_charge": extension_charge,
        "total_price": total
    }