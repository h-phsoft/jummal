# Define the 4x4 square
square = [
    [16, 3, 2, 13],
    [5, 10, 11, 8],
    [9, 7, 6, 12],
    [4, 15, 14, 1]
]

# Calculate the required values

# خانات الضلع = عدد الخانات في كل ضلع (Number of cells in each side)
# For a 4x4 square, each side has 4 cells
khanat_al_dila = 4

# الوفق = مجموع القيم في خانات الضلع (Sum of values in one side)
# In a magic square, all rows, columns, and diagonals sum to the same value
# Let's calculate the sum of the first row
wafq = sum(square[0])

# المفتاح = أصغر قيمة (Minimum value)
mikhtah = min(min(row) for row in square)

# المغلاق = أكبر قيمة (Maximum value)
mughlaq = max(max(row) for row in square)

# العدل = المفتاح والمغلاق (The justice - combination of min and max)
# This typically means the pair or sometimes the sum
adl = (mikhtah, mughlaq)

# الأس = قيمة الوفق منقوصًا منها عدد خانات الضلع (Base = Wafq minus number of side cells)
uss = wafq - khanat_al_dila

# المساحة = مجموعة قيم الخانات كلها (Area = Sum of all cell values)
misaha = sum(sum(row) for row in square)

# الضابط = مجموعة الوفق مع المساحة (Controller = Sum of Wafq and Misaha)
dabit = wafq + misaha

# الغاية = ضعف قيمة الضابط (Goal = Double the Controller)
ghayah = 2 * dabit

# الأصل = حاصل ضرب الغاية في المغلاق (Origin = Goal multiplied by Maximum)
asl = ghayah * mughlaq

# جبر الكسر (Fixing the fraction)
# In traditional Arabic mathematics, this often refers to completing or adjusting
# For magic squares, this could mean verifying the magic constant or adjustments
# Since all values are integers and this is a perfect magic square, no fraction needs fixing
jabr_al_kasr = "لا يحتاج"  # Not needed / No fraction to fix

# Print results
print("=== حسابات المربع الوفقي 4x4 ===\n")
print(f"المربع:")
for row in square:
    print(row)
print()
print(f"خانات الضلع = {khanat_al_dila}")
print(f"الوفق = {wafq}")
print(f"المفتاح = {mikhtah}")
print(f"المغلاق = {mughlaq}")
print(f"العدل = {adl} (المفتاح: {mikhtah}, المغلاق: {mughlaq})")
print(f"الأس = {uss}")
print(f"المساحة = {misaha}")
print(f"الضابط = {dabit}")
print(f"الغاية = {ghayah}")
print(f"الأصل = {asl}")
print(f"جبر الكسر = {jabr_al_kasr}")

# Verification: Check if it's a valid magic square
row_sums = [sum(row) for row in square]
col_sums = [sum(square[i][j] for i in range(4)) for j in range(4)]
diag1 = sum(square[i][i] for i in range(4))
diag2 = sum(square[i][3-i] for i in range(4))

print("\n=== التحقق من صحة المربع السحري ===")
print(f"مجموع الصفوف: {row_sums}")
print(f"مجموع الأعمدة: {col_sums}")
print(f"القطر الرئيسي: {diag1}")
print(f"القطر الثانوي: {diag2}")
print(f"جميع المجاميع متساوية: {all(s == wafq for s in row_sums + col_sums + [diag1, diag2])}")
