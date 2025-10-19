---
title: C与指针笔记10-13
date: 2025-10-19
tags: [C]
pinned: false
head:
  - - meta
    - name: description
      content: structure C_Pointer memory_allocate
  - - meta
    - name: keywords
      content: 结构体定义和属性 结构体存储规则 结构体的使用 动态内存分配函数 动态内存分配注意事项 高级指针用法 回调函数 函数指针数组与转换表 
---

高级 高级 还是 高级

---

# 🤖 结构和联合

- C提供了两种类型的*聚合数据类型(aggregate data type)*。**数组**是相同类型的元素的集合，**结构体**是可具有不同类型的元素的集合。

- ***数组***可以通过下标访问，且数据不能相互赋值，只能通过循环逐个赋值。
- ***结构体***通过名字访问，相同类型的结构体变量可以相互赋值。

## 10.1 结构基础知识

- 结构体是一些值的集合，这些值称为它的**成员(member)**，<u>但一个结构体的各个成员可能具有不同的类型。</u>

- <u>结构变量属于标量类型，所以你可以像对待其他标量类型那样执行相同类型的操作。</u>

### 10.1.1 结构声明

在声明结构时，必须列出它包含的所有成员。

~~~shell
struct tag {member-list} variable-list;
~~~

结构声明语法的不同

~~~shell
struct {
  int   a;
  char  b;
  float c;
}x;


struct {
  int   a;
  char  b;
  float c;
} y[20],*z;
~~~

<u>这两个声明被编译器当作两种截然不同的类型，即使它们的成员列表完全相同。</u>

~~~shell
z = &x;
~~~

这条语句是非法的。

- 使用 **标签(tag)** 和 **类型定义别名(typedef)** 来更方便地声明和定义一个结构体变量。

**标签(tag)** 字段允许为成员列表提供一个名字。

~~~shell
struct SIMPLE{
  int   a;
  char  b;
  float c;
};

struct SIMPLE x,y[20],*z;
~~~

这个声明使用标签来创建变量，且现在`x`,`y`,`z`都是同一种类型的结构变量。

**类型定义别名(typedef)** 字段可以创建一个新的类型。

~~~shell
typedef struct {
  int   a;
  char  b;
  float c;
} Simple;

Simple x;
Simple y[20], *z;
~~~

`Simple`现在是一个类型而不是个结构标签。
> 如果你想在多个源文件中使用同一种类型的结构，你应该把标签声明或`typedef`形式的声明放在一个头文件中。当源文件需要这个声明时可以使用`#include`指令把那个头文件包含进来。

### 10.1.2 结构成员

~~~shell
struct COMPLEX{
  float f;
  int a[20];
  long *lp;
  struct SIMPLE s;
  struct SIMPLE sa[10];
  struct SIMPLE *sp;
};
~~~

结构成员可以是标量、数组、指针甚至是其他结构体。

### 10.1.3 结构成员的直接访问

- 结构变量的成员是通过点操作符`.`访问的。
- 点操作符接受两个参数，左操作数就是结构变量的名字，右操作数就是需要访问的成员的名字。这个表达式的结果就是指定的成员。

~~~shell
struct COMPLEX comp;
(comp.s).a; // 类型为struct SIMPLE 
(comp.sa)[4]; // 同上类型的数组
((comp.sa)[4]).c // 取出数组元素
结合性都是从左到右
comp.sa[4].c; equals ((comp.sa)[4]).c;
~~~

### 10.1.4 结构成员的间接访问

- 对于指向结构体的指针要访问其元素应该执行**间接访问操作`->`**。

~~~shell
void func(struct COMPLEX *cp);
// 第一种访问方式
(*cp).f;
// 第二种访问方式
cp->f;
~~~

### 10.1.5 结构的自引用

~~~shell
// 作为结构这种声明是非法的，程序内部会无限包含自身和结构的成员。(永不终止的递归程序)
// 如果我定义了 struct SELF_REF1 b; 那么 sizeof(SELF_REF1) = sizeof(int) + (4+4+4+.....) + sizeof(int)
// 无法计算，无法在内存中分配一个固定大小的空间。

struct SELF_REF1 {
  int   a;
  struct SELF_REF1 b; // 非法，不能这样定义。
  int   c;

};

// 作为指针这个声明是合法的，因为指针的长度在编译器确定结构体长度前就知道了。
// sizeof(SELF_REF2) = sizeof (int) + sizeof(SELF_REF2*) + sizeof(int)
// 可以计算固定大小空间

struct SELF_REF2{
  int   a;
  struct SELF_REF2 *b;
  int   c;
};

~~~

**<u>事实上一个结构内指向自身结构的指针所指向的是同一种类型的不同结构。</u>**
更高级的数据结构如链表和树，都是用这些技巧实现的。每个结构指向链表的下一个元素或树的下一个分支。

~~~shell
// 这个结构体创建失败了，因为SELF_REF3 直到声明的末尾才定义，所以在结构
// 声明的内部时还尚未定义。
typedef struct {
  int   a;
  SELF_REF3 *b;
  int   c;
}SELF_REF3;

// 解决方案是定义一个结构标签来声明b
typedef struct SELF_REF3_TAG {
  int   a;
  struct SELF_REF3_TAG *b;
  int   c;
}SELF_REF3
// 这次正确定义了结构体。
~~~

### 10.1.6 不完整的声明

- 在声明一些相互之间存在依赖的结构时使用不完整声明(incomplete declaration)

~~~shell
struct B;

struct A {
    struct B  *parnter;
      
};
struct B {
    struct A  *partner;
};
~~~

在A的成员列表中需要标签B的不完整声明。一旦A被声明之后，B的成员列表也可以被声明。

### 10.1.7 结构的初始化

- 位于花括号，由逗号分隔。

~~~shell
struct INI_EX {
  int   a;
  short b[10];
  Simple c;

}x = {
  10,
  {1,2,3,4,5},
  {25,'x',1.9},
};
// 另一种初始化
struct INI_EX x1 = {
  10,
  {1,2,3,4,5},
  {25,'x',1.9},
};
~~~

## 10.2 结构、指针和成员

声明和定义一些结构体和结构体变量

~~~shell
typedef struct {
  int   a;
  short b[2];
}Ex2;

typedef struct EX{
  int   a;
  char  b[3];
  Ex2   c;
  struct EX   *d;
}Ex;

// 定义并初始化
Ex x = {10, "Hi", {5,{ -1 , 25 }}, 0};
Ex *px = &x;
~~~

### 10.2.1 访问指针

**step1:** `px`是一个指针变量，`px`的表达式`Ex *px = x;`表示作为左值的`px`旧值将被一个新值取代。
> 考虑表达式`px + 1`。这个表达式并不是一个合法的左值，因为它的值并不存储于任何可标识的内存位置。`px`的右值更有意思，如果px指向一个结构数组的元素，这个表达式将指向该数组的下一个结构。就算如此`px + 1`仍是非法的，因为我们没办法分辨内存下一个位置所存储的是这些结构元素之一还是其他东西。编译器无法检测到这类错误。

### 10.2.2 访问结构

**step2:** `*px`的右值是px所指向的整个结构。可以用于同类型结构体赋值，作为点操作符的左操作数，访问一个指定的成员，作为参数传递给函数，作为函数的返回值返回。`px`的左值是从`x`接收来的新值，它将接受它的所有成员的新值。

- 作为左值，重要的是位置，而不是这个位置所保存的值。

表达式`*px + 1`是非法的，因为`*px`的结果是一个结构。C语言并没有定义结构体和整型值之间的加法运算。但表达式`*(px+1)`中的`px+1`表示结构体指针但x是一个标量所以这个表达式也是非法的。

### 10.2.3 访问结构成员

**step3:** 表达式`px->a`右值是`10`,`x.a`和`px->a`值相同。

<u>`*px`和`px->a`之间的关系</u>。在这两个表达式中`px`所保存的地址都用于寻找这个结构。但结构体的第一个成员是`a`。所以`a`的地址和结构的地址是一样的。<u>这样`px`看上去是指向整个结构，同时指向结构的第一个成员。</u>但是他们的类型不同，变量`px`被声明为一个指向结构的指针，所以表达式`*px`的结果是整个结构而不是它的第一个成员。

~~~shell
int *pi;

pi = px;
// 这个操作是非法的，因为它们的类型不匹配。
pi = (int *)px;
// 使用强制类型转换就能奏效

// 但是这种方法很危险，因为它避开了编译器的类型检查。
// 正确的表达式更为简单
pi = &px->a;
// -> 操作符的优先级高于&操作符的优先级，所以这个表达式无需使用括号。

~~~

`px->b`的值是一个指针常量，因为`b`是一个数组这个表达式`px->b`不是一个合法的左值。

~~~shell
char *pc;
pc = px->b; // 一个指针常量
pc = px->b[1]; // 指向数组的第二个元素
~~~

### 10.2.4 访问嵌套的结构

**step4:** 表达式`px->c`也是指向一个结构体，它的左值是整个结构。

~~~shell
int num = px->c.a; 指向结构体内结构体并访问结构体成员a
short *num1 = px->c.b;
int num2 = *px->c.b;
~~~

### 10.2.5 访问指针成员

**step5:** `px->d`的右值是0，左值是本身的内存位置。`*px->d`是非法的操作，因为d内包含了一个NULL指针，所以它不指向任何东西。

~~~shell
Ex te;
te = *px->d;
x.d = &te;
~~~

> **空指针的本质：地址0**
>> 空指针是一个特殊的指针值，它表示该指针不指向任何有效的内存对象。
>> *解引用空指针后CPU会尝试访问地址0*-->*操作系统会捕获异常*-->*触发硬件异常(Page Fault)或(Segmentation Fault)*-->*内核终止程序*。

## 10.3 结构的存储分配

- 编译器按照成员列表的顺序一个接一个地给每个成员分配内存。<u>只有当存储成员时需要满足正确的边界要求时，成员之间才可能出现用于填充的额外内存空间。</u>

~~~shell
struct ALIGN{
  char  a;
  int   b; 
  char  c;
};
~~~

这个结构体实际分配了12个字节的内存空间但是有6个字节空间实际上不能访问。

~~~shell
struct ALIGN2{
  int b;
  char a;
  char c;

};
~~~

这个结构体实际分配了8个字节的内存空间。（两个字符可以紧挨着存储，最后有2个字节被浪费）
> 但是实际上依程序的可维护性和可读性而言不是特别大的内存损失都不需要重新排。

- 在程序创建成百上千个结构体时内存浪费问题就更为明显。
- 可以使用`offsetof`宏（定义于`stddef.h`）判断结构体内成员距离首地址的偏移值

~~~shell
offsetof(type,member) // type 是结构体类型名，member是结构体里面的成员名
offsetof(struct ALIGN, b) // 返回值是 4,也就是成员a占用了4个字节用于结构体内内存对齐
~~~

## 10.4 作为函数参数的结构

- 非必要不建议将结构体作为函数参数传递
- 结构体作为一个标量的大小可能会比想象中的大

~~~shell
typedef struct
{
  char    product[PRODUCT_SIZE];
  int     quantity;
  float   unit_price;
  float   total_amount;
};

void print_receipt(Transaction trans);
void print_receipt(Transaction *trans);
~~~

一个传递的是结构体的拷贝，一个传递的是结构体指针。就大小而言指针比结构体小得多，效率更高。

~~~shell
Transaction print_receipt(Transaction trans);
void print_receipt(Transaction *trans);
~~~

如果结构体作为函数返回值在堆栈上的操作效率会更低，传递结构体指针可以直接在函数内部完成结构体成员的修改。

## 10.5 位段

- 结构体具有实现 **位段(bit field)** 的能力
- 位段的成员是一个或多个位的字段，这些不同长度的字段实际上存储于一个或多个整型变量中。
- 位段成员必须声明为`int`,`unsigned int`,`signed int`, `_Bool(C99)`类型，在成员名的后面是一个冒号和一个整数。
- 不能对位段成员取地址(不能使用`&`运算符)
- 位段不能是数组
- 可移植性的程序应该避免使用位段。
- 位段和结构体成员一样之间需要内存对齐(在位段与位段之间插入填充位(Padding))

~~~shell
struct CHAR {
  unsigned  ch  : 7;
  unsigned font : 6;
  unsigned size : 19;
};
~~~

因为最后一个位段`size`过于庞大(大于短整型的长度)，所以可以利用前两个位段`ch`和`font`所剩余的位来增加`size`的位数，这样就避免了声明一个32位的整数来存储`size`位段。
> CHAR这个结构体内的位段说明了位段可以把长度为奇数的数据包装在一起，节省存储空间

## 10.6 联合

- 联合所有成员引用的是**内存中的相同位置**
- 适用于在不同时刻把不同的东西存储于同一个位置时

~~~shell
union {
  float f;
  int   i;
} fi;

fi.f = 3.14159;
printf("%d\n", fi.i);
~~~

在一个浮点型和整型都是32位的机器上，变量 `fi` 只占据内存中的一个32位的字。最后用占位符`%d`输出一个浮点数不是`3`而是`1078530000`，与IEEE754单精度浮点标准有关。

### 10.6.1 变体记录

- 内存中某个特定的区域将在不同的时刻存储不同类型的值

在 C 语言中，可以使用 **联合体（Union）** 和 **结构体（Struct）** 结合的方式来模拟 `Pascal` 语言中的**变体记录（Variant Record）**，也称为**带标签的联合体（Tagged Union）**。

这种模式是 C 语言处理异构数据集合的标准方法，同时提供了类型安全性和可预测性。

#### 一个存货系统的变体记录

~~~shell
// 前两个结构指定每个零件和装配件必须存储的内容
struct PARTINFO {
  int     cost;
  int     supplier;
};

struct SUBASSYINFO {
  int     n_parts;
  struct {
    char partno[10];
    short quan;
  }part[MAXPARTS];
};

// 存货记录包含每个项目的一般信息并包含了一个联合
struct INVREC {
  char    partno[10];
  int     quan;
  enum    { PART, SUBPASSY }    type;
  union   {
          struct PARTINFO       part;
          struct SUBASSYIINFO   subassy;
  }info;
};

// 操作名为 rec 的 INVERC 结构变量
if (rec.type == PART){
  y = rec.info.part.cost;
  z = rec.info.part.supplier;
}
else{
  y = rec.info.subpassy.nparts;
  z = rec.info.subpassy.parts[0].quan;
}
~~~

### 10.6.2 联合的初始化

- 联合初始化的初始值必须是联合第一个成员的类型，且必须位于一对花括号里

~~~shell
union {
  int   a;
  float b;
  char  c[4];
} x = { 5 };
~~~

> 把`x.a`初始化为 5,如果给出的初始值是任何其他类型都会被转换为一个整数并赋值给`x.a`

# ♿ 动态内存分配

- 数组的元素存储于内存中连续的位置上。当一个数组被声明时，它所需要的内存在**编译时**就被分配。但是也可以使用动态内存分配在**运行时**为它分配内存。

## 11.1 为什么使用动态内存分配

如果是已经知道数量大小的数组分配发生在编译时，但如果在编译时不能确定数组长度(数组的长度常常在运行时才知道)，因为所需内存空间取决于输入数据。

## 11.2 malloc和free

- `malloc`执行动态内存分配`free`执行分配内存的释放。这些函数维护一个可用内存池。
- `malloc`分配的动态内存没有初始化，可以使用`calloc`函数初始化也可以手动初始化。

函数原型(在`stdlib.h`中声明)

~~~C
void *malloc(size_t size);
void *free(void *pointer);
~~~

`malloc`分配的是一块连续的内存，如果请求分配100字节的内存那么实际分配的内存就是100个连续的字节。
> `malloc`分配的内存可能比请求的内存大小稍微多一点，这个行为是由编译器定义的。

内存池如果是空的(可用内存无法满足请求)`malloc`函数会像操作系统请求得到更多的内存。并在这块新的内存上执行分配任务。如果操作系统无法向malloc提供更多的内存，malloc就返回一个NULL指针。***因此对malloc所分配的内存确保其是非空(NULL)是非常重要的***。

~~~C
int *a_pointer = (int*)malloc(sizeof(int) * 100);
if (a_pointer == NULL)
  return -1; // 在函数内提前退出并返回错误值-1
~~~

`free`的参数只能是`NULL`或是之前请求分配内存函数`malloc`,`calloc`或`realloc`的返回值。向`free`函数传递一个NULL参数没有任何意义。
> 因为malloc的返回值是一个`void*`类型，在比较老的编译器(C89或之前)可能会要求对返回值进行强制类型转换(int*)。

> 二次释放和悬空指针：对同一块内存调用两次`free(ptr)`会导致堆损坏和程序崩溃；`free(ptr)`后`ptr`仍然指向已释放的内存。为了安全应立即执行`ptr=NULL`将指针置为空指针，避免后续误用。

## 11.3 calloc和realloc

函数原型(在`stdlib.h`中声明)

~~~C
void *calloc(size_t num_elements, size_t element_size);
void *realloc(void *ptr,size_t new_size);
~~~

`calloc`也用于分配内存，而`realloc`用于修改一个原先已经分配的内存块大小，使用`realloc`可以扩大和缩小内存大小。

> `malloc`分配的内存是未初始化的，内容是随机的垃圾值；`calloc`分配的内存会被初始化为全0。  
> `realloc`重新分配内存大小失败时会返回NULL但原始指针ptr指向的内存块仍有效，数据保持不变。

> realloc(NULL,size) == malloc(size)  
> realloc(ptr,0) == free(ptr)并返回NULL

## 11.4 使用动态分配的内存

~~~C
int *pi;
...
pi = malloc(100); // 如果分配成功，在整型为 4 个字节大小的机器上被当作25个整型元素的数组
pi = malloc(25 * sizeof(int)); // 这种分配方式更好一些因为它是可移植的
...
// 使用内存：为内存分配元素
int *pi2, i;

pi2 = pi;
for(;pi2 != pi + 25;)
  *pi2++ = 0;

// 使用下标
for(i = 0; i < 25; i++)
  pi[i] = 0;
~~~

## 11.5 常见的动态内存错误

- 释放内存的一部分是不允许的，动态分配的内存必须一起释放。可以使用`realloc`函数缩小一块动态分配的内存并有效地释放尾部的部分内存(还是用原分配函数的返回值)

~~~C
pi = malloc(10 * sizeof(int));
free(pi + 5); // 释放部分内存
~~~

**内存泄露**

分配内存但在使用完毕后不释放将引起内存泄露(memory leak)。在那些所有执行程序共享一个通用内存池的操作系统中，内存泄露将一点点地榨干可用内存。

其他操作系统能够记住每个程序当前拥有的内存段，这样当一个程序终止时，所有分配给它但未被释放的内存都归还给内存池。

# 🤧使用结构和指针

## 12.1 链表

- **链表(linked_list)** 就是一些包含数据的独立数据结构的集合。链表中的每个节点通过链或指针连接在一起。程序通过指针访问链表中的节点。通常节点是动态分配的，也有由节点数组构建的链表。

## 12.2 单链表

- 在单链表中，每个节点包含一个指向链表下一节点的指针。链表最后一个节点的指针字段的值为`NULL`，提示链表后面不在有其他节点。在找到链表的第一个节点后，指针就可以带你访问剩余的所有节点。为了记住链表的起始位置，可以使用一个**根指针(root pointer)**。根指针指向链表的第一个节点。注意根指针只是一个指针，它不包含任何数据。

~~~C
typedef struct NODE{
  struct NODE *link; // 指向下一个节点的指针
  int         value; // 存储数据的变量 
} Node;
~~~

> 单链表无法从结束位置往前遍历

### 12.2.1 在单链表中插入

~~~C
// 插入到一个有序的单链表。函数的参数是一个指向链表第一个节点的指针以及需要插入的值。

#include <stdlib.h>
#include <stdio.h>
#include "sll_node.h"

#define FALSE 0
#define TRUE  1

int sll_insert(Node *current, int new_value)
{
  Node *previous;
  Node *new;

  // 寻找正确的插入位置，方法是按顺序访问链表，直到到达其值大于或等于新插入值的节点。
  
  while(current->value < new_value)
  {
    previous = current;
    current = current->link;
  }
  // 为新节点分配内存，并把新值存储到新节点中，如果内存分配失败。
  // 函数返回false
  new = (Node*)malloc(sizeof(Node));
  if (new == NULL)
    return FALSE;
  new->value = new_value;

  // 把新节点插入到链表中，并返回true 
  new->link = current;
  previous->link = new; 
  return TRUE;
}
~~~

~~~C
result = sll_insert(root,12); // 假设有一个节点存储15，插入在这个节点前
~~~

- 这个插入函数是**不正确**的，它不能处理插入最后一个节点后的场景(最后一个节点的link为NULL)，也不能处理插入第一个节点前的场景(函数不能访问root，previous未定义)
- 可以将一个指向root的指针作为参数传递给函数。然后使用间接访问，函数不仅可以获得root(指向链表第一个节点的指针，也就是根指针)的值，也可以向它存储一个新的指针值(解决current和previous分开的问题，函数总是可以判断Node\*\*是否满足条件并间接访问root判断值大小是否满足。Node\*\*总是作为当前节点的前一个链接字段。)

~~~C
#include <stdlib.h>
#include <stdio.h>
#include "sll_node.h"

#define FALSE 0
#define TRUE  1

int sll_insert(Node **rootp, int new_value)
{
  Node *current;
  Node *previous;
  Node *new;
  
  // 得到指向第一个节点的指针
  current = *rootp;
  previous = NULL;
  
  // 寻找正确的插入位置，方法是按序访问链表，直到到达一个其值大于或等于新值的节点
  while(current != NULL && current->value < new_value)
  {
    previous = current;
    current = current->link;
  }

  // 为新节点分配内存，并把新值存储到新节点中，如果内存分配失败，
  // 函数返回false
  new = (Node*)malloc(sizeof(Node));
  if (new == NULL)
    return FALSE;
  new->link = current;
  if (previous == NULL)
    *rootp = new;
  else
    previous->link = new;
  return TRUE;
}

int sll_insert_ease(Node **head, int new_value)
{
  Node *new_node;
  
  // current_ptr 现在指向的是一个指针 (head 或 link 字段)
  // 初始时指向调用者的 head 指针变量
  Node **current_ptr = head;
  
  // 1. 寻找插入位置：循环直到指针指向NULL(末尾)或指向的值 >= new_value
  while (*current_ptr != NULL && (*current_ptr)->value < new_value)
    current_ptr = &(*current_ptr)->link;
  
  // 2. 分配新节点
  new_node = (Node*)malloc(sizeof(Node));
  if (new_node == NULL)
    return FALSE;
  new_node->value = new_value;
  
  // 3. 插入：新节点指向 current_ptr 当前指向的那个节点
  new_node->link = *current_ptr;
  
  // 4. 核心：更新current_ptr 指向的指针变量，让它指向新节点
  *current_ptr = new_node; // *current_ptr 其实就是上一个节点的link
  return TRUE;
}
// 书上的优化
int sll_insert(register Node **linkp, int new_value)
{
  register Node *current;
  register Node *new;
  
  while ((current = *linkp) != NULL && current->value < new_value)
    linkp = &current->link;

  new = (Node*)malloc(sizeof(Node));
  if (new == NULL)
    return FALSE;
  new->value = new_value;
  
  new->link = current;
  *linkp = new;
  return TRUE;
}
~~~

## 12.3 双链表

- 单链表的替代方案是双链表。在一个双链表中，每个节点都包含两个指针，指向前一个节点的指针和指向后一个节点的指针。这样就可以以任何方向遍历双链表，甚至可以忽前忽后地在双链表中访问。

~~~C
typedef struct NODE {
  struct NODE   *fwd;
  struct NODE   *bwd;
  int           value;
};
~~~

现在存在两个指针：一个指向链表的第一个节点(*fwd)，另一个指向最后一个节点(*bwd)。如果当前链表为空，这两字段都为`NULL`。

### 12.3.1 在双链表中插入

- `dll_insert`函数接受两个参数：一个指向根节点的指针和一个整型值。
- 先前所编写的单链表插入函数把重复的值也添加到链表中。在有些应用程序中，不插入重复的值可能更为合适。`dll_insert`函数只有当欲插入的值原先不存在于链表中时才将其插入。

考虑四种情况：

1. 新值可能必须插入到链表的中间位置。
2. 新值可能必须插入到链表的起始位置。
3. 新值可能必须插入到链表的结束位置。
4. 新值可能必须既插入到链表的初始位置，又插入到链表的结束位置(即原链表为空)。

~~~C
/*
  把一个值插入到一个双链表，rootp是一个指向根节点的指针，
  value是欲插入的新值
  返回值：如果欲插值原先已存在于链表中，函数返回0；
  如果内存不足导致无法插入，函数返回-1；如果插入成功，函数返回1。
*/
#include <stdlib.h>
#include <stdio.h>
#include "doubly_linked_list_node.h"

int dll_insert(Node *rootp, int value)
{
  Node *this;
  Node *next;
  Node *newnode;
  
  /*
    查看value是否已经存在于链表中，如果是就返回
    否则，为新值创建一个新节点("newnode"将指向它)
    "this"将指向应该在新节点之前的那个节点。
    "next"将指向应该在新节点之前的那个节点。
  */
  for (this = rootp; (next = this->fwd) != NULL; this = next){
    if (next->value == value)
      return 0;
    if (next->value > value)
      break;
  }

  newnode = (Node*)malloc(sizeof(Node));
  if (newnode == NULL)
    return -1;
  newnode->value = value;

  // 把新值添加到链表中
  if (next != NULL)
  {
    // 情况1或2:并非位于链表尾部
    if (this != rootp) // 情况1：并非位于链表起始位置
    {
      newnode->fwd = next;
      this->fwd = newnode;
      newnode->bwd = this;
      next->bwd = newnode;
    }
    else // 情况2：位于链表的起始位置
    {
      newnode->fwd = next;
      rootp->fwd = newnode;
      newnode->bwd = NULL;
      next->bwd = newnode;
    }   
  }
  else
  {
    // 情况3或4:位于链表的尾部
    if (this != rootp) // 情况3：并非位于链表的起始位置
    {
      newnode->fwd = NULL;
      this->fwd = newnode;
      newnode->bwd = this;
      rootp->bwd = newnode;
    }
    else // 情况4：位于链表的起始位置
    {
      newnode->fwd = NULL;
      rootp->fwd = newnode;
      newnode->bwd = NULL;
      rootp->bwd = newnode;
    }
  }
  return 1;
}
~~~

#### 语句提炼(statement factoring)
>
> 上面的双链表在最后判断节点插入位置时各个嵌套的if语句群存在大量的相似之处，可以使用**语句提炼**技巧消除这些重复代码

~~~C
if (x == 3)
{
  i = 1;
  some statement;
  j = 2;
}
else
{
  i = 1;
  some statement different;
  j = 2; 
}
~~~

> 这里不管`x == 3`的值是真是假，语句`i = 1` 和 `j = 2`都将执行。且这两天语句在if条件判断前都不会执行，所以：

~~~C
i = 1; 
if (x == 3)
  some statement;
else 
  some statement different;
j = 2;
~~~

> ***但是如果是对测试的结果有所影响的语句千万不能提炼出来！***

~~~C
/*
  双链表部分代码使用语句提炼
*/
// 把新节点添加到链表中
if(next != NULL)
{
  newnode->fwd = next;
  if (this != rootp)
  {
    this->fwd = newnode;
    newnode->bwd = this;
  }
  else
  {
    rootp->fwd = newnode;
    newnode->bwd = NULL;
  }
  next->bwd = newnode;
}
else
{
  newnode->fwd = NULL;
  if (this != rootp)
  {
    this->fwd = newnode;
    newnode->bwd = this;
  }
  else
  {
    rootp->fwd = newnode;
    newnode->bwd = NULL;
  }
  rootp->bwd = newnode;
}
~~~

第二个简化技巧

~~~C
if (pointer != NULL)
  field = pointer;
else
  field = NULL;
~~~

这段代码的意思是设置一个和pointer相等的变量，如果pointer未指向任何东西，这个变量就设置为NULL。但是：

~~~C
field = pointer;
~~~

这个代码的意思其实和上面的一模一样，也就是第三四种情况的else语句内的`newnode->fwd = NULL`可以写成`newnode->fwd = next`；同理`rootp->fwd = newnode`也可以写成`this->fwd = newnode`。

~~~C
/*
  最终提炼的双链表插入函数
*/
#include <stdio.h>
#include <stdlib.h>
#include "doubly_linked_list_node.h"

int dll_insert(register Node *rootp, int value)
{
  register Node *this;
  register Node *next;
  register Node *newnode;
  
  /*
    查看value是否已经存在于链表中，如果是就返回。
    否则，为新值创建一个新节点("newnode"将指向它)。
    "this"将指向应该在新节点之前的那个节点，
    "next"将指向应该在新节点之后的那个节点。
  */
  for (this = rootp; (next = this->fwd) != NULL; this = next)
  {
    if (next->value == value)
      return 0;
    if (next->value > value)
      break;
  }
  newnode = (Node*)malloc(sizeof(Node));
  if (newnode == NULL)
    return -1;
  newnode->value = value;

  // 把新节点添加到链表中
  newnode->fwd = next;
  this->fwd = newnode;

  //if (this != rootp)
  //  newnode->bwd = this;
  //else
  //  newnode->bwd = NULL;
  newnode->bwd = (this != rootp) ? this : NULL;
  
  //if (next != NULL)
  //  next->bwd = newnode;
  //else
  //  rootp->bwd = newnode;
  (next != NULL ? next : rootp)->bwd = newnode;
  return 1;
}
~~~

# ☘️ 高级指针话题

## 13.1 进一步探讨指向指针的指针

- 二级指针的存在是为了间接访问指针元素（简单的赋值并不总是可行）

### 一个例子

~~~C
int i; 
int *p1;
int **ppi;
~~~

上面的声明在内存中创建了相应的变量。如果是自动变量则无法猜测初始值是多少。

~~~C
1. printf("%d\n",ppi);
2. printf("%d\n",&ppi);
3. *ppi = 5;
~~~

1. 如果`ppi`是一个自动变量，它就未被初始化，这条语句将打印一个随机值。如果它是一个静态变量，这条语句将打印0。
2. 这条语句把ppi的地址作为10进制打印，没有什么用。
3. 不可预测，对`pi`不应该执行初始化，因为它尚未被初始化。

> 对一个未被初始化的指针(野指针)进行解引用并向它所指向的随机内存地址写入值会导致未定义行为，极有可能触发**段错误(Segmentation Fault)**

~~~C
ppi = &pi;
*ppi = &i;
~~~

这两条语句把`pi`(通过`ppi`间接访问)初始化为指向变量`i`。

~~~C
i = 'a';
*pi = 'a';
**ppi = 'a';
~~~

这三条语句都可以对i进行赋值，但是简单的赋值并不总是可行。
> 如果想在一个自定义函数内修改调用者（如 main 函数）中声明的普通变量的值，需要传入该变量的一级指针。
如果想在自定义函数内释放外部函数中分配的动态内存，同时将外部的原始指针变量置为 NULL，则需要传入一个二级指针。

## 13.2 高级声明

### 几个例子

|函数|类型|
|:---:|:---:|
|int f|一个整型变量|
|int *f|一个指向整型的指针|
|int f|一个返回值为整型的函数|
|int *f()|一个返回值为指向整型的指针的函数|
|int (*f)()|一个指向返回值为整型的函数的指针|
|int *(*f)()|一个指向返回值为指向整型的指针的函数的指针|
|int f[]|一个整型数组|
|int *f[]|一个元素为指向整型的指针的数组|
|***int f()[]***|非法，f是一个函数，返回值是一个整型数组，但是函数只能返回标量值不能返回数组|
|***int f\[\]()***|非法，f是一个数组，它的元素类型是返回值为整型的函数，但数组元素必须有相同的长度，但不同的函数显然可能具有不同的长度|
|int (*f[])()|一个数组，数组的每个元素都是一个指针，该指针指向一个返回值为整型的函数|
|int *(*f[])()|一个数组，数组的每个元素都是一个指针，该指针指向一个返回值为指向整型的指针的函数|

带额外参数的函数定义

~~~C
int (*f)(int ,float);
int *(*g[])(int ,float);
~~~

## 13.3 函数指针

- 函数指针最常见的两个用途是 **转换表(jump table)** 和 **作为参数传递给另一个函数**。

> 简单声明一个函数指针并不意味着它可以立即使用。和其他指针一样对函数指针执行间接操作之前必须把它初始化为*指向某个函数*。

~~~C
int f(int);
int (*pf)(int) = &f;
~~~

初始化表达式中的`&`操作符是可选的，因为**函数名**被使用时总是由编译器把它转换为**函数指针**。
> int (*pf)(int) = f;
``
在函数指针被声明并且初始化后，就可以使用三种方式调用函数：

~~~C
int ans;
ans = f(25);
ans = (*pf)(25);
ans = pf(25);
~~~

上面第一种调用函数的方法其实是函数`f`首先被转换为一个函数指针，该指针指定函数在内存中的位置。然后，函数调用操作符调用该函数，执行开始于这个地址的代码。

后面两条函数调用操作和第一种是一样的。

### 13.3.1 回调函数

一个用于在单链表中查找一个值的函数，参数是一个指向链表第一个节点的指针以及那个需要查找的值

~~~C
Node*
search_list (Node *node, int const value)
{
  while (node != NULL)
  {
    if (node->value == value)
      break;
    node = node->link;
  }
  return node;
}
~~~

这个函数只适用于值为整数的链表。如果需要在一个字符串链表中查找不得不编写另一个函数且内容和这个函数类似。

一个更通用的方法是使查找函数与类型无关，这样它就能用于任何类型的值的链表。使用**函数指针**解决对多种节点类型的比较，将函数指针作为参数传入函数内执行比较操作。

我们无法在这个上下文环境中为回调函数编写一个准确的原型，因为我们并不知道进行比较的值的类型。事实上，我们需要查找函数能作用于任何类型的值。解决这个难题的方法是把参数类型声明为`void*`，表示“一个指向未知类型的指针”。

> 在使用比较函数中的指针之前，它们必须被强制转换为正确的类型。因为强制类型转换能够躲过一般的类型检查，所以在使用时必须额外小心，确保函数的参数类型是正确的。

一种实现方法

~~~C
/*
  在一个单链表中查找一个指定值的函数，它的参数是一个指向链表第一个节点的指针，
  一个指向我们需要查找的值的指针和一个函数指针，它所指向的函数用于比较存储于链表中类型的值。

  这里node未被声明为const，如果node被声明为const，函数将不得不返回一个const结果，
  这将限制调用程序，它变无法修改查找函数所找到的节点。
*/
#include <stdio.h>
#include "node.h"

Node*
search_list(Node *node, void const *value, int (*compare)(void const *, void const*))
{
  while (node != NULL)
  {
    if (compare(&node->value, value) == 0)
      break;
    node = node->link;
  }
  return node;
}
~~~

一个可用的int类型比较函数

~~~C
int compare_ints(void const *a, void const *b)
{
  if (*(int*)a == *(int*)b)
    return 0;
  else 
    return 1;
}
~~~

对字符串链表可用的查找

~~~C
#include <string.h>
...
desired_node = search_list(root, "desired_value", strcmp);
// int strcmp (const char *s1, const char *s2);
~~~

库函数`strcmp`所执行的比较和我们需要的完全一样，不过有些编译器会发出警告信息，因为它的参数被声明为`char*`而不是`void*`。

### 13.3.2 转移表

一个袖珍式计算器：具体操作和选择操作的代码分离

~~~C
double add(double,double);
double sub(double,double);
double mul(double,double);
double div(double,double);

switch(oper)
{
  case ADD:
    result = add(op1, op2);
    break;
  case SUB:
    result = sub(op1, op2);
    break;
  case MUL:
    result = mul(op1, op2);
    break;
  case DIV:
    result = div(op1, op2);
    break;
  default:
    break;
}
~~~

使用转换表实现计算机：声明函数指针数组并确保`add`，`sub`这些函数在函数指针数组前声明

~~~C
double (*oper_func[])(double, double) = {
  add, sub, mul, div, ...
};

result = oper_func[oper](op1, op2);
~~~

`oper`从数组中选择正确的函数指针，而函数调用操作符将执行这个函数。
> 在转换表中越界下标引用和使用其他数组一样是不合法的。

> 函数指针数组是 C 语言中实现分发逻辑（Dispatching）和状态机的一种强大机制。它允许你通过数组索引来调用不同的函数。
>> 可以使用`typedef`简化函数指针数组

~~~C
// 1. 定义函数指针类型： FuncPtr
typedef double (*FuncPtr)(double, double);
// 2. 使用 typedef 后的类型声明数组
FuncPtr oper_func[] = {add, sub, mul, div};
result = oper_func[oper](op1, op2);
~~~

## 13.4 命令行参数

处理命令行参数可以使用指针的指针

### 13.4.1 传递命令行参数

C程序的main函数具有两个形参，通常称为`argc`和`argv`

~~~C
int main (int argc, char **argv);
int main (int argc, char **argv);
~~~

1. `argc`存储一个整数值，表示程序在命令行被调用时，参数的总数量。这个数量包括程序本身的名称（可执行文件名），argc的值总是大于等于1
2. `argv`用于访问用户在命令行输入的具体字符串参数。

~~~C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char **argv)
{
  //1. 打印参数总数
  printf("总共参数数量：%d\n",argc);
  
  // 2. 遍历所有参数
  printf("所有参数：\n");
  for (int i = 0; i < argc; i++)
    // argv[i] 是一个 char* 直接用 %s 打印字符串
    printf("argv[%d]: %s\n", i, argv[i]);
  
  // 3. 检查特定参数（检查是否提供了-v选项）
  for (int i = 1; i < argc; i++)
  {
    if (strcmp(argv[i],"-v") == 0)
      printf("\n检测到详细(verbose)模式。\n");
  }

  return 0;
}
~~~

终端执行(传递命令行参数)

~~~shell
gcc -Wall -std=c11 -g ***.c -o ***
./*** arg1 arg2 arg3 ... -v
~~~

一个**echolike**程序的c代码

~~~C
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char **argv)
{
  // 打印参数，直到遇到NULL指针，程序名被跳过
  while (*++argv != NULL)
    printf("%s\n", *argv);
  return EXIT_SUCCESS;
}
~~~

### 13.4.2 打印命令行参数

更通用的命令行参数处理(区分选项参数和文件名参数)

~~~C
#include <stdio.h>
#define TRUE 1

// 执行实际任务的函数的原型 
void process_standard_input(void);
void process_file(char *file_name);

// 选项标志，缺省初始化为FALSE
int option_a, option_b;

void main(int argc, char **argv)
{
  // 处理选项参数：跳到下一个参数并检查它是否以一个横杠开头
  while (*++argv != NULL && **argv == '-')
  {
    // 检查横杠后面的字母
    switch (*++*argv)
    {
      case 'a':
        option_a = TRUE;
        break;
      case 'b':
        option_b = TRUE;
        break;
    }
  }

  // 上面的代码可以被下面的替代
  // while ((opt = *++*argv) != '\0')
  // {
  //   switch (opt){
  //     case 'a':
  //       option_a = TRUE;
  //       break;
  //   }
  // }

  // 处理文件名参数
  if (*argv == NULL)
      process_standard_input();
  else{
    do{
      process_file(*argv);
    }while(*++argv != NULL);
  }
}
~~~

## 13.5 字符串常量

- 当一个字符串常量出现在表达式中时，它的值是一个指针常量。编译器把这些指定字符的一份拷贝存储在内存的某个位置，并存储一个指向第一个字符的指针。但是当数组名用于表达式时，它们的值也是指针常量。我们可以对它们进行下标引用、间接引用以及指针运算。

~~~C
"xyz" + 1
~~~

第一眼可能认为这个表达式毫无意义，但只要把字符串常量看作指针时，它的意义就非常清楚了。这个表达式计算“指针值加上1”的值。它的结果是个指针，指向字符串中的第二个字符:`y`

那么这个表达式又是什么呢？

~~~C
*"xyz"
~~~

如果`xyz`是一个“指向字符的指针”，那么这个间接访问的结果就是它所指向的字符`x`

一个另类的字符`z`的表达式

~~~C
"xyz[2]
~~~

一个偏移量超出字符串范围的表达式，这个表达式的结果就是一个不可预测的字符

~~~C
*("xyz" + 4)
~~~

什么时候人们可能想使用类似上面的这些形式的表达式呢？

~~~C
// 把二进制值转换为字符并把他们打印出来。
void binary_to_ascii(unsigned int value)
{
  unsigned int quotient;
  
  quotient = value / 10;
  if (quotient != 0)
    binary_to_ascii(quotient);
  putchar(value % 10 + '0');
}
~~~
