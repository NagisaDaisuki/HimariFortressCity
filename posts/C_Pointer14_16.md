---
title: C与指针笔记14-16
date: 2025-11-4
tags: [C]
pinned: false
head:
  - - meta
    - name: description
      content: Preprocessor Standard_I/O_Operation Standard_Function_Library
  - - meta
    - name: keywords
      content: 预处理器 标准输入输出 标准函数库 预定义符号 define 宏定义 宏与函数 undef 条件编译 文件包含 scanf printf 流处理 流定位函数 流打开函数 
---
预处理、流处理和标准函数库
---

# 🍋‍🟩 预处理器

编译一个C程序涉及很多步骤。其中第一个步骤被称为**预处理(preprocessing)阶段**。C预处理器在源代码编译之前对其进行一些文本性质的操作。它的主要任务包括删除注释、插入被`#include`指令包含的文件的内容、定义和替换由`#define`指令定义的符号以及确定代码的部分内容是否应该根据一些条件编译指令进行编译。

## 14.1 预定义符号

|**符号**|**样例值**|**含义**|
|:---:|:---:|:---:|
|\_\_FILE\_\_|"name.c"|进行编译的源文件名|
|\_\_LINE\_\_|25|文件当前行的行号|
|\_\_DATE\_\_|"Jan 31 1997"|文件被编译的日期|
|\_\_TIME\_\_|"18:04:30"|文件被编译的时间|
|\_\_STDC\_\_|1|如果编译器遵循ANSI C，其值就为1，否则未定义|

`__FILE__`和`__LINE__`在确认调试输出的来源方面很有用处。`__DATE__`和`__TIME__`常常用于在被编译的程序中加入版本信息。`__STDC__`用于那些在ANSI环境和非ANSI环境都必须进行编译的程序中结合条件编译。

**更多实用的预定义符号**

|**符号**|**样例值**|**含义**|
|:---:|:---:|:---:|
|\_\_STDC\_VERSION\_\_|202311|显示编译器当前版本号|
|\_\_func\_\_|main|显示当前所在函数函数名|
|\_\_GUNC\_\_|15|和下面两个预定义符号一起使用，显示gcc当前符号|
|\_\_GUNC\_MINOR\_\_|2|同上|
|\_\_GUNC\_PATCHLEVEL\_\_|1|同上|
|\_\_OPTIMIZE\_\_|1|判断是否使用code optimization|
|\_\_x86\_64\_\_|1|判断系统芯片架构，下面一致|
|\_\_i386\_\_|1|同上|
|\_\_aarch64\_\_|1|同上|
|\_\_arm\_\_|1|同上|
|\_\_powerpc64\_\_|1|同上|
|\_\_powerpc\_\_|1|同上|

## 14.2 #define

在一些简单的用法中`#define`就是为数值命名一个符号

`#define`更为正式的描述

~~~C
#define name stuff
~~~

替换文本并不限于数值字面值常量。使用`#define`指令，你可以把任何文本替换到程序中。

~~~C
#define reg         register
#define do_forever  for(;;)
#define CASE        break;case
~~~

如果定义中的stuff非常长，它可以分成几行，除了最后一行之外，每行的末尾都要加一个反斜杠。

~~~C
#define DEBUG_PRINT(x,y,z)   printf( "File %s line %d:" \
                             " x=%d, y=%d, z=%d", \
                             __FILE__, __LINE__, \
                             x, y, z ) 
~~~

这里使用了相邻的字符串常量被自动连接为一个字符串的这个特性。
> #define 语句末尾不需要加分号`;`
还可以使用`#define`指令把一序列语句插入到程序中。

~~~C
#define PROCESS_LOOP \
        for (i = 0; i < 10; i += 1){  \
            sum += i;                 \
            if (i > 0)                \
            prod *= i;                \
        }
~~~

> 不要滥用这种技巧，如相同的代码需要出现在程序的几个地方，函数是一个更好的实现办法。

### 14.2.1 宏

- #define 机制包括了一个规定，允许把参数替换到文本上，这种实现通常称为 **宏(macro)** 或定义宏(defined macro)

~~~C
#define name(parameter-list) stuff
~~~

`parameter-list(参数列表)`是一个由逗号分隔的值的列表，每个值都与宏定义中的一个参数相对应

~~~C
// 一个接受一个参数的宏
#define SQUARE(x) x * x

// 正常使用没有问题
SQUARE(5) // 返回值是 25

// 下面是这个定义的问题
int a;
a = 5; 
printf("%d\n",SQUARE(a + 1));
// 这里返回值返回 11 而不是 36

// 被替换宏文本
printf("%d\n", a + 1 * a + 1);
// 根据四则运算先执行 1 * a 后执行两个加法
// 修改为
#define SQUARE(x) (x) * (x)
// 这样就可以避免第一个问题

// 另一个问题
#define DOUBLE(x) (x) + (x)
a = 5;
printf("%d\n", 10 * DOUBLE(a));
// 这里返回的是 55 而不是 100
printf("%d\n", 10 * (a) + (a));
// 在原来的定义外添加一个括号
#define DOUBLE(x) ((x) + (x))
// 就可以解决这个问题
~~~

> 所有用于对数值表达式进行求值的宏定义都应该用这种方式加上括号

**一种有趣的宏**

~~~C
#define repeat do
#define until(x) while(!(x))

// 上面的宏定义将下面的循环替换

// 替换
do{
  statements;
}while(!(i >= 10));

// 为
repeat {
  statements;
} until (i >= 10);
~~~

> 应该避免一直使用这种写法
>
### 14.2.2 #define 替换

1. 在调用宏时，首先对参数进行检查，看看是否包含了任何由`#define`定义的符号。如果是，它们首先被替换。
2. 替换文本随后被插入到程序中原来文本的位置。对于宏，参数名被他们的值所替代。
3. 最后，再次对结果文本进行扫描，看看它是否包含了任何由`#define`定义的符号。如果是就重复上述处理过程。

这样宏参数和`#define`可以包含其他`#define`定义的符号。但是宏不可以出现递归。

- 当预处理器搜索`#define`定义的符号时，字符串常量的内容并不进行检查。有两种将宏参数插入到字符串常量的方法

~~~C
#define PRINT(FORMAT, VALUE) \
      printf( "The value is " FORMAT "\n", VALUE)
... 
PRINT("%d", x + 3)
~~~

> 这种技巧只有当字符串常量作为宏参数给出时才能使用

~~~C
#define PRINT(FORMAT, VALUE) \
    printf( "The value of " #VALUE \
    " is " FORMAT "\n", VALUE )
...
PRINT( "%d", x + 3 ) // The value of x + 3 is 25 
~~~

- 第二个技巧使用预处理器把一个宏参数转换为一个字符串。`#argument`这种结构被预处理器翻译为`argument`。

- `##`结构则执行一种不同的任务。它把位于它两边的符号连接成一个符号。作为用途之一，它允许宏定义从分离的文本片段创建标识符。

~~~C
#define ADD_TO_SUM ( sum_number, value ) \
    sun ## sum_number += value
... 
ADD_TO_SUM( 5, 25 );
// 这条语句的意思是 sum5 += 25; 这种连接必须产生一个合法的标识符。否则其结果就是未定义的。
~~~

### 14.2.3 宏与函数

~~~C
#define MAX(a,b) ((a) > (b) ? (a) : (b))
~~~

使用宏来定义简单计算而不是函数有两个优点：

1. 用于调用和从函数返回的代码可能比实际执行这个小型计算工作的代码更大，所以对于简单函数使用宏比使用函数在***程序的规模和速度方面都更胜一筹***。
2. 函数的参数必须声明一种特定的类型，上面这个宏定义可以用于整型、长整型、单浮点型、双浮点型等其他的类型。***宏是与类型无关的***。

还有一些任务无法用函数实现只能用宏定义实现。

~~~C
#define MALLOC(n, type) \ 
    ( (type*)malloc( (n) * sizeof(type)))
// 被转换为
pi = MALLOC(25, int);
pi = ((int*)malloc((25) * sizeof(int)));
~~~

> 请注意宏定义并没有用一个分号结尾。分号出现在调用这个宏的语句中。
>
### 14.2.4 带副作用的宏参数

当宏参数在宏定义中出现的次数超过一次时，如果这个参数具有副作用那么当你使用这个宏时就可能出现危险，导致不可预料的结果。**副作用**就是在表达式求值时出现的永久性效果。例如 :

~~~C
x + 1
~~~

可以重复执行几百次，它每次获得的结果都是一样的。这个表达式不具有副作用。但是：

~~~C
x++
~~~

就具有副作用：它增加`x`的值。当这个值在下一次执行时，它将产生不同的结果。

~~~C
#define MAX(a,b) ((a) > (b) ? (a) : (b))
...
x = 5;
y = 8;
z = MAX( x++, y++ );
printf("x=%d, y=%d, z=%d\n", x, y, z);
// MAX的结果执行后 x = 6, y = 10, z = 9
// 虽然那个较小的值只增加了一次，但那个较大的值却增加了两次(y++) ? (y++)
z = ((x++) > (y++) ? (x++) : (y++));
~~~

### 14.2.5 命名约定

为了区分宏定义和函数的区别需要一个**命名约定**，最明显的区别就是函数名一般用全小写字母，宏定义用全大写字母。

***宏和函数的不同之处***

|属性|#define宏|函数|
|:---:|:---:|:---:|
|代码长度|每次使用时，宏代码都被插入到程序中。除了非常小的宏之外，程序的长度将大幅度增长|函数代码之处限于一个地方；每次使用这个函数时，都调用那个地方的同一份代码|
|执行速度|更快|存在函数调用/返回的额外开销|
|操作符/优先级|宏参数的求值是在所有周围表达式的上下文环境里，除非它们加上括号，否则邻近操作符的优先级可能会产生不可预料的结果|函数参数只在函数调用时求值一次，它的结果值传递给函数。表达式的求值结果更容易预测|
|参数求值|参数每次用于宏定义时，它们都将重新求值。由于多次求值，具有副作用的参数可能会产生不可预测的结果|参数在函数被调用前只求值一次。在函数中多次使用参数并不会导致多种求值过程。参数的副作用并不会造成任何特殊的问题|
|参数类型|宏与类型无关。只要对参数的操作是合法的，它可以使用于任何参数类型|函数的参数是与类型有关的。如果参数的类型不同，就需要使用不同的函数，即使它们执行的任务是相同的|

### 14.2.6 #undef

- 这条预处理指令用于移除一个宏定义。

~~~C
#undef name
~~~

如果一个现存的名字需要被重新定义，那么它的旧定义首先必须用`#undef`移除。

### 14.2.7 命令行定义

许多C编译器提供了在命令行中定义符号，用于启动编译过程。

~~~C
int array[ARRAY_SIZE];

-Dname
-Dname=stuff

cc -DARRAY_SIZE=100 prog.c
~~~

## 14.3 条件编译

- 只用于调试程序的语句就是一个明显的例子它们不应该出现在程序的产品版本中，**但是你可能并不想把这些语句从源代码中物理删除，因为如果需要一些维护性修改时，你可能需要重新调试这个程序，还需要这些语句**。
- 条件编译(conditional compilation)就是用于实现这个目的。

~~~C
#if constant-expression
      statements
#endif
~~~

其中`constant-expression`（常量表达式）由预处理器进行求值。如果它的值是非零值（真），那么`statements`部分就被正常编译，否则预处理器就安静地删除它们。

~~~C
#define DEBUG 1
#if DEBUG
  printf(statements);
#endif
~~~

一个简单的使用条件编译

`#if`的子句`#elif`和`#else`

~~~C
#if constant-expression
      statements
#elif  constant-expression
      other statements ...
#else 
      other statements
#endif
~~~

### 14.3.1 是否被定义

~~~C
#if defined(symbol)
#ifdef symbol

#if !defined(symbol)
#ifndef symbol
~~~

`#if`形式的语句功能更强。因为常量表达式可能包含额外的条件

~~~C
#if X > 0 || defined(ABC) && defined(BCD)
~~~

> 一些老K&R C编译器并未包含所有功能。

### 14.3.2 嵌套指令

~~~C
#if defined( OS_UNIX )
  #ifdef OPTION1
  unix_version_of_option1();
  #endif
  #ifdef OPTION2
  unix_version_of_option2();
  #ifdef OPTION3
  unix_version_of_option3();
#elif defined( OS_MSDOS )
  #ifdef OPTION2
  msdos_version_of_option2();
  #endif
#endif
~~~

> 在每个#endif 后添加一个注释标签可以很好地区分每个嵌套的指令

## 14.4 文件包含

- 一个头文件如果被包含到10个源文件中，它实际上被编译了10次。

> 但实际上这种额外开销实际上并不大。
>
### 14.4.1 函数库文件包含

头文件包含语法

~~~C
#include <filename>
~~~

> UNIX 系统上使用`<>`包含的头文件一般在目录`/usr/include`查找
>> 编译器有一个选项`-I`允许把其他目录添加到这个列表中
>>
### 14.4.2 本地文件包含

~~~C
#include "filename"
~~~

> 优先从.c文件或.h文件所在的当前目录查找
>
### 14.4.3 嵌套文件包含

~~~C
#include "a.h"
#include "b.h"
// 如果b.h 文件里包含了a.h，那么a.h在当前文件就被包含了两次
--------
// another file
#ifndef _HEADERNAME_H
#define _HEADERNAME_H 1 // #define _HEADERNAME_H
// All the stuff that you want in the header file
#endif

// 使用这种方法并不能直接不调用第二次该文件，但是文件内的所有文件会在第二次调用被弃用
~~~

> 这种处理将拖慢编译速度，所以可能尽量避免出现多重包含

## 14.5 其他指令

### 14.5.1 #error

当程序编译之后，`#error`指令允许你生成错误信息，并强制终止编译过程。

~~~C
#error text of error message
// 使用案例
#if defined(OPTION_A)
    stuff needed for optionA
#elif defined(OPTION_B)
    stuff needed for optionA
#elif defined(OPTION_C)
    stuff needed for optionC
#else
    #error No option selected!
#endif

// 检查 C 标准版本
#if __STDC_VERSION__ < 199901L
#error "本项目要求 C99 或更高版本的编译器！"
#endif

#ifdef WINDOWS_ENV 
    // 针对 Windows的代码...
#elif defined(LINUX_ENV)
    // 针对 Linux的代码...
#else
#error "必须定义 WINDOWS_ENV 或 LINUX_ENV 宏以指定编译环境！"
~~~

### 14.5.2 #line

`#line`指令用于改变编译器对当前代码行号和文件名的追踪。

~~~C
#line number "string"
// number 将当前源代码行的行号设置为这个数字
// string 可选，将编译器追踪的文件名设置为这个字符串

// 例子
// 原始文件名 line.c  假设
#include <stdio.h>

int a = 1;

#define DEBUG 0
#undef DEBUG
// gcc -std=c11 -g -Wall -DDEBUG=0 line.c
// gcc -std=c11 -g -Wall -DDEBUG=1 line.c
// 使用-DNAME 控制定义名的值
#if DEBUG
#line 100 "generated_code.c"
#endif
void func() {
  int b = 2;       // 编译器现在认为这是 generated_code.c 的 101 行
  int c = "error"; // 故意制造一个错误
}

// 恢复到当前文件的实际行号
#line __LINE__

int main(void) {
  func();
  return 0;
}
~~~

### 14.5.3 #progma

- 一种特殊的预处理器指令，用于向编译器发出特殊指令或特定于实现的功能。
- `#progma` 的行为完全取决于编译器。

~~~C
#progma 记号序列
// -------------
#progma once // 非标准但广泛使用，确保头文件只被编译一次，防止重复包含错误。
// 不是C标准的一部分，但是几乎所有的现代编译器(GCC, Clang, MSVC)都支持。
#progma STDC // C99/C11 标准用于控制浮点运算和线程。

#progma pack(n) // 控制结构体对齐
// 改变结构体的内存对齐方式
struct DefaultStruct {
  char c;
  int i; // 4 字节，可能有三字节的填充
};

// 设置对齐为 1字节
#progma pack(push, 1)

struct PackedStruct {
  char c; // 1字节
  int i; // 4 字节，紧跟在 c 之后，没有填充
};

#progma pack(pop) // 恢复默认对齐设置
~~~

# 🎶 输入/输出函数

- ANSI C和早期C相比的最大优点之一就是它在规范里所包含的函数库。每个ANSI编译器必须支持一组规定的函数，并具备规范所要求的接口，而且按照规定的行为工作。

## 15.1 错误报告

`perror`函数以一种简单、统一的方式报告错误。（原型定义于stdio.h）

~~~C
void perror(char const *message);
~~~

> 标准库函数在程序存在错误时在一个外部整型变量`errno`（在errno.h中定义）中保存错误代码后把这个信息传递给用户程序，提示操作失败的准确原因。
>> perror最大的优点就是容易使用。

## 15.2 终止执行

`exit`函数用于终止一个程序的执行。（原型定义于stdlib.h）

~~~C
void exit(int status);
~~~

`status`参数返回给操作系统，用于提示程序是否正常完成。
> 预定义符号EXIT_SUCCESS 和 EXIT_FAILURE 分别提示程序的终止是成功还是失败。
>> 一般执行完`perror`后都会执行`exit`

## 15.3 标准I/O函数库

- 标准I/O函数库是在原先I/O库基础上的实现和扩展，例如为printf创建了不同的版本。且函数库引入了缓冲I/O的概念，提高了绝大多数程序的效率。

> 但是标准函数库是在某台特定类型机器上实现的，在其他不同类型的机器上运行相同的程序会出现无法运行的情况。

- ANSI C函数库中的I/O函数在可移植性和完整性上更加完善。

> ANSI C的一个主要优点就是这些修改是通过**增加不同的函数**方式实现，而不是通过对现存函数进行修改来实现，保证了程序的可移植性。

## 15.4 ANSI I/O概念

- 头文件`<stdio.h>`包含了与ANSI函数库的I/O部分有关的声明。

> 尽管不包含这个头文件也能使用某些I/O函数，但绝大多数函数都需要包含这个头文件。
>
### 15.4.1 流

- ANSI C对I/O的概念进行抽象，所有的I/O操作只是简单的移入/移出字节。这种字节流便称为**流(stream)**。

1. 核心概念：抽象(Abstraction)

- **流的本质**：流是对所有I/O操作的抽象
- **统一接口**：所有的I/O设备都被视为类似的设备。
- **程序视角**：对C程序而言，所有的I/O操作都只是在流上进行字节的移进或移出。
- **细节隐藏**：特定的I/O设备的细节对程序员是隐藏的。

2. 核心机制：缓冲(Buffering)

大多数流是***完全缓冲的(fully buffered)***

- **读取操作**：当进行"读取"时，实际上是从一块较大的缓冲区(buffer)中读取数据。当缓冲区空时，程序才通过设备或文件读取下一块较大的输入数据并重新填充缓冲区。
- **写入操作**："写入"也是先写入到内存中的缓冲区，直到缓冲区写满时，数据才被一次性写入(flush,冲洗或刷新)到设备或文件。
- **效率优势**：这种块状写入和读取操作由于减少了与设备或文件的交互次数，能够实现更快速的I/O。

解决输出延迟

~~~C
printf("something or other");
fflush(stdout); // 立即将缓冲区内容写出
~~~

> 在通常的编程测试中，stdout默认是行缓冲模式。

~~~C
// 没有\n触发自动刷新，会暂停五秒后再执行printf
#include <stdio.h>
#include <unistd.h> // for sleep

int main() {
    // 1. 没有 \n，数据进入缓冲区，但不会自动刷新
    printf("等待 5 秒，你可能看不到我...");
    
    // 2. 暂停执行
    sleep(5); 

    // 3. 补上 \n
    printf("\n我现在出来了。\n"); 
    return 0;
}
~~~

~~~C
// 有\n触发自动刷新，会先执行printf后等待五秒后执行另一个printf
#include <stdio.h>
#include <unistd.h> // for sleep

int main() {
    printf("等待 5 秒，你应该能看到我...\n");
    
    // 2. 暂停执行
    sleep(5); 

    // 3. 补上 \n
    printf("\n我现在出来了。\n"); 
    return 0;
}
~~~

> stdin是类似的，都是行缓冲模式。

- 对于输入流来说，只有缓冲区空了，程序才会从外部设备获取新的数据来填充它。
- 对于输出流来说，只有缓冲区满了，缓冲区中的数据才会被写入到外部设备，进行刷新。

#### 一、文本流(Text Stream)

流分为两种，**文本(text)流** 和 **二进制(binary)** 流。文本流的有些特性在不同的系统中可能不同。其中之一就是文本行的最大长度。标准规定至少允许254个字符。另一个可能不同的特性是文本行的结束方式。例如在***MS-DOS***系统中，文本文件约定以一个回车符和一个换行符（或称为行反馈符）结尾。但是***UNIX***系统只使用一个换行符结尾。

- 核心特点：字符翻译

文本流在数据传输中会引入一个**翻译层**，主要针对换行符(`\n`)：

|操作|C程序中的表示|操作系统/文件中实际存储的表示|
|:---:|:---:|:---:|
|写入(`fprintf`,`fputs`)|写入一个换行符(`\n`)|操作系统可能会将其翻译成一个或多个字符序列(例如Windows下的`\r\n`)|
|读取(`fscanf`,`fgets`)|从文件中读取多个字符序列（例如Windows下的`\r\n`）|C运行时库会将这个序列翻译回单个换行符(`\n`)供C程序使用。|

- 优点：保持了跨平台的**文本文件兼容性**。可以在任何系统上打开并正确显示用文本模式创建的文件。
- 缺点：传输的数据量可能与文件中实际存储的字节数**不一致**（因为翻译），且性能略低于二进制流。

#### 二、二进制流(Binary Stream)

二进制流中的字节将完全根据程序编写它们的形式写入到文件或设备中，而且完全根据它们从文件或设备读取的形式读入到程序中。并未做任何改变。

- 核心特点：无翻译

二进制流是**透明的**，它绕过了C运行时库的任何翻译：

|操作|C程序中的表示|操作系统/文件中实际存储的表示|
|:---:|:---:|:---:|
|写入(`fwrite`)|写入N个字节|文件中精确存储N个字节，不做任何修改。|
|读取(`fread`)|读取N个字节|从文件中读取N个原始字节到内存中，不做任何修改。|

- 优点：1.精确性：文件中的字节数与程序处理的字节数总是精准匹配。适用于存储图片、音频、结构体、加密数据等。2.性能：由于没有翻译开销，I/O操作通常更快。
- 缺点：**缺乏可移植性**。如果直接将C结构体写入二进制文件，文件将依赖于机器的字节序(Endianness)和数据类型大小。

#### 三、编程实现上的区别

在C语言中，你通过`fopen()`函数的第二个参数（模式字符串）来指定使用哪种流模式：

|模式|描述|
|:--|:--|
|`"r"`/`"w"`/`"a"`|文本模式(默认)|
|`"rb"`/`"wb"`/`"ab"`|二进制模式(加`b`)|

### 15.4.2 文件

`stdio.h`所包含的声明之一就是`FILE`结构。`FILE`是一个数据结构，用于访问一个流。如果同时激活几个流每个流都有一个相应的`FILE`与它关联。

- 对于每个ANSI C程序，运行时系统必须提供至少三个流：**标准输入(standard input)**、**标准输出(standard output)**和**标准错误(standard error)**。名字分别为`stdin`、`stdout`、`stderr`。这三个流都是指向`FILE`结构的指针。

> 标准输入是缺省输入来源，标准输出是缺省输出设置，标准错误是缺省错误设置。通常标准输入为键盘设置，标准输出为终端或屏幕。
> 可以将标准输入和标准输出设置为其他设备。

### 15.4.3 标准I/O常量

`EOF`是许多函数的返回值，提示达到了文件尾。**EOF所选择的实际值比一个字符多几位，这是为了避免二进制被错误地解释为EOF。**

- 输入函数返回`int`类型：`getchar()`和`fgetc()`等函数被设计为返回`int`(32位或16位)，而不是`char`(8位)。
- EOF的值：一般为负整数`-1`。

|状态|返回值|位宽利用|
|:---:|:---:|:---:|
|成功读取有效字符|返回值是一个0到255之间的整数|仅使用了`int`的低8位来存储字符代码，其余位是0。|
|遇到文件结束(EOF)|返回值是一个负整数(-1)|`int`的所有位都被设置成-1的二进制表示(所有32位都是1)|

> 一个程序至少可以打开**FOPEN_MAX**个文件，至少是8。有一个常量**FILENAME_MAX**提示字符数组应该多大以便容纳编译器所支持的最长合法文件名。

## 15.5 流I/O总览

对于文件流或设备流

1. 使用`FILE*`将处于活动状态的文件选择使用。
2. 流通过调用`fopen`函数打开。为了打开一个流必须指定要访问的文件或设备以及他们的访问方式。`fopen`和操作系统验证文件或设备确实存在并初始化FILE结构。
3. 对文件或设备读取写入。
4. 最后调用`fclose`函数关闭流。防止被再次访问，保证任何存储于缓冲区的数据被正确地写到文件中，并且释放FILE结构使它可以用于另外的文件。

> 标准流不需要打开或关闭。

**执行字符、文本行和二进制I/O的函数**

|数据类型|输入|输出|描述|
|:---|:---|:---|:---|
|字符|getchar|putchar|读取(写入)单个字符|
|文本行|gets/scanf|puts/printf|文本行未格式化的输入(输出)/格式化的输入(输出)|
|二进制数据|fread|fwrite|读取(写入)二进制数据|

> 带f前缀的输入输出函数可以用于所有流。

## 15.6 打开流

`fopen`函数用于创建并打开一个新流。

~~~C
FILE *fopen(char const *name, char const *mode);
~~~

`mode`参数上面编程实现给出
> 在mode 中添加 `a+`表示该文件打开用于更新，并且流既允许读也允许写。
> 但是在向流写入数据前必须调用其中一个文件定位函数(`fseek`、`fsetpos`、`rewind`)。
> 在写后又想读取数据首先必须调用`fflush`函数或文件定位函数之一。

应该始终检查`fopen`函数的返回值！如果函数失败，它会返回一个NULL值。

~~~C
FILE *input;
input = fopen("data3", "r"); // 文本只读
if (input == NULL)
{
  perror("failed to open file data3, Quitting...");
  exit(EXIT_FAILURE);
}
// 在终端报错类似：data3: No such file or directory
~~~

`freopen`函数用于打开（或重新打开）一个特定的文件流。原型如下：

~~~C
FILE* freopen(char const *filename, char const *mode, FILE *stream);
~~~

最大的作用是改变流的输入输出
> `freopen`函数在执行成功时，它返回的指针和传入的第三个参数`stream`是同一个指针，即它们都指向同一个`FILE`结构体。

~~~C
#include <stdio.h>
#include <stdlib.h> // 用于 EXIT_FAILURE

int main() {
    // 1. 初始状态：printf 输出到终端
    printf("--- 程序开始 ---\n");
    printf("这条信息应该显示在终端上。\n");

    // =======================================================
    // 2. 使用 freopen 重定向标准输出 (stdout)
    //    参数: 
    //      "log.txt": 新的文件名
    //      "w": 写入模式 (会覆盖文件原有内容)
    //      stdout: 要重定向的目标流
    // =======================================================
    FILE *original_stdout = freopen("log.txt", "w", stdout);

    // 检查重定向是否成功
    if (original_stdout == NULL) {
        // 如果重定向失败，通常是文件路径问题
        perror("freopen 失败");
        return EXIT_FAILURE;
    }

    // 3. 重定向后的状态：printf 输出到 log.txt 文件
    printf("这条信息不会显示在终端，而是写入 log.txt。\n");
    printf("freopen 成功地将标准输出改变了方向。\n");
    printf("--- 程序结束 ---\n");

    // 4. 关闭文件流并返回
    // freopen 已经关闭了旧的 stdout（终端），并打开了新的文件。
    // 程序结束时会自动关闭 log.txt，但明确关闭是好习惯
    if (fclose(stdout) != 0) {
        perror("关闭 stdout 失败");
    }
    
    // 注意：程序不会输出任何成功信息到终端，因为它被重定向了
    return 0;
}
~~~

## 15.7 关闭流

使用`fclose`关闭流

~~~C
int fclose(FILE *f);
~~~

`fclose`函数在文件关闭前刷新缓冲区。执行成功返回0值，否则返回EOF。
> 是否应该对fclose(或其他操作)进行错误检查？
>>
>> 1. 如果操作成功应该执行什么？  
>> 2. 如果操作失败应该执行什么？
>>
>>> 如果这两个答案是不同的，应该进行错误检查；如果是相同的，跳过错误检查才是合理的。

## 15.8 字符I/O

字符输入

~~~C
int fgetc(FILE *stream);
int getc(FILE *stream);
int getchar(void);
~~~

字符输出

~~~C
int fputc(int character,FILE* stream);
int putc(int character,FILE* stream);
int putchar(int character);
~~~

### 15.8.1 字符I/O宏

除了`fgetc`和`fputc`其他都是`#define`指令定义的宏，两种实现为了不同的场景，但是实际两种操作相差甚微。

### 15.8.2 撤销字符I/O

在流读取时总有一个不想读取的字符，但使用流逐个读取没有条件判断一定会读到一个不满足的字符，为了不丢弃这个字符，使用`ungetc`函数将这个字符从参数中推回stream中。

> `ungetc`函数主要的应用场景是**超前扫描**或**令牌解析**

读取一个整数，直到遇到非数字或EOF

~~~C
#include <stdio.h>
#include <ctype.h> // 用于 isdigit()

// 函数：从标准输入读取一个整数
int read_integer(FILE *stream) {
    int ch;
    int value = 0;

    // 1. 跳过开始的空白字符
    do {
        ch = fgetc(stream);
    } while (isspace(ch));

    // 2. 检查第一个非空白字符是否是数字
    if (!isdigit(ch)) {
        // 如果第一个字符不是数字，就把它放回流中
        if (ch != EOF) {
            ungetc(ch, stream);
        }
        return 0; // 或者返回一个错误代码
    }

    // 3. 读取数字部分
    while (isdigit(ch)) {
        value = value * 10 + (ch - '0');
        ch = fgetc(stream); // 超前读取下一个字符
    }

    // 4. 【核心步骤】
    // 循环停止是因为 ch 遇到了第一个非数字字符（或者 EOF）。
    // 这个非数字字符（例如一个字母 'A'）不属于当前的整数，它属于流的下一个部分。
    if (ch != EOF) {
        ungetc(ch, stream); // 将这个超前读取的字符放回流中
    }
    
    return value;
}

int main() {
    int num1, num2;
    
    printf("请输入数据 (例如: 123ABC456)\n");
    
    // 假设用户输入: 123ABC456\n

    // 第一次调用：读取 123
    num1 = read_integer(stdin); 
    printf("读取到第一个整数: %d\n", num1); 
    // 此时字符 'A' 被 read_integer 读走后又放回了 stdin。

    // 第二次调用：读取下一个字符，它将是 'A'
    printf("下一个字符是: %c\n", fgetc(stdin)); 
    
    // 第三次调用：读取 456
    // read_integer 会消耗 'B', 'C'，直到 456
    // num2 = read_integer(stdin); // 错误：会消耗 'B', 'C'
    
    printf("流中剩余字符:\n");
    // 清空并打印剩余部分，以验证 ungetc 后的字符 'A' 确实被读取了
    int ch;
    while ((ch = getchar()) != EOF) {
        putchar(ch);
    }
    
    return 0;
}
~~~

> 退回字符和流的当前位置有关，如果使用`fseek`,`fsetpos`或`rewind`函数改变了流的位置，所有退回的字符都要被丢弃。
>
## 15.9 未格式化的行I/O

行I/O可以使用两种方式执行————未格式化的和格式化的。这两种形式都用于操作字符串。

~~~C
char *fgets(char* buffer, int buffer_size, FILE *stream);
char *gets(char *buffer);

int fputs(char const *buffer, FILE* stream);
int puts(char const *buffer);
~~~

`fgets`从指定的stream读取字符并把它们复制到buffer中。在读取到换行符或缓冲区内存储的字符达到`buffer_size - 1`时停止读取。

> gets在C99后不推荐使用，C11后已经完全抛弃！在任何情况下`fgets`都会在末尾添加NUL字节表示字符串结束；puts会自动在尾部添加换行符；fputs不会添加换行符。

常见错误

~~~C
#include <stdio.h>

int main() {
    char data[5];

    // 错误操作：数组只有5个字节，但写入了6个字符，没有留空间给 '\0'
    // 实际上是写入了 'H', 'e', 'l', 'l', 'o'，'\0' 溢出到了 data 之外
    // 但在这个例子中，我们假设用 memcpy 或其它方式精确地填满 data，没有 \0
    data[0] = 'A';
    data[1] = 'B';
    data[2] = 'C';
    data[3] = 'D';
    data[4] = 'E'; // <--- 数组已满，没有空终止符

    printf("尝试写入一个非终止字符串...\n");

    // fputs 将会从 data[0] 开始一直读到内存中找到 \0 为止
    // 这将是 UB！
    fputs(data, stdout); 

    printf("\n程序可能崩溃，或者输出了乱码。\n");

    return 0;
}
~~~

> `fgets`第二个参数虽然能指定传入的元素个数，但是如果参数过大溢出它的缓冲区，`fgets`不会引起错误。

一个例子

~~~C
/*
  把标准输入读取的文本行逐行复制到标准输出。
*/
#include <stdio.h>

#define MAX_LINE_LENGTH 1024

void copylines(FILE *input, FILE *output)
{
  char buffer[MAX_LINE_LENGTH];
  
  while( fgets(buffer, MAX_LINE_LENGTH, input) != NULL)
    fputs(buffer, output);
}
~~~

## 15.10 格式化的行I/O

- “格式化的行I/O”这个名字从某种意义上并不准确，因为 `scanf` 和 `printf` 函数家族并不仅限于单行。它们也可以在行的一部分或多行上执行I/O操作。

### 15.10.1 scanf家族

~~~C
int fscanf(FILE *stream, char const *format, ...);
int scanf(char const *format, ...);
int sscanf(char const *string, char const *format, ...);
~~~

***函数无法验证对应的指针参数输入是否是对应格式代码的正确类型。函数会假定它们是正确的，于是继续执行并使用它们。***

### 15.10.2 scanf格式代码

- **空白字符**————与输入中的零个或多个空白字符相匹配，在处理过程中将被忽略。
- **格式代码**————它们指定函数如何解释接下来的输入字符。
- **其他字符**————当任何其他字符出现在格式字符串时，下一个输入字符必须与它匹配。如果匹配，该输入字符随后被丢弃；如果不匹配，函数就不再读取直接返回。

#### 格式代码格式

- 格式代码都是以一个百分号开头，后面可以是
  - 一个可选的星号（赋值抑制符）
  - 一个可选的宽度
  - 一个可选的限定符
  - 格式代码

- 可选的星号具体使用方法
假输入流中有数据：`Item_A: 100, Item_B: 200`

~~~C
int val_b;
// 使用 %*s 跳过 "Item_A:"
// 使用 %*d 跳过 100
// 使用 %*c 跳过 逗号和空格
// Item_B: 选项被匹配后丢弃
// 只读取Item_B 的值
scanf("%*s %*d, Item_B: %d",&val_b);

// 结果：val_b 将被赋值为 200，流中的 "Item_A: 100, "部分被跳过
~~~

#### scanf限定符

| 限定符 | 作用 (用于指定参数大小) | 适用的类型码 | 对应的 C 类型 |
| :---: | :--- | :--- | :--- |
| **`h`** | 读取短整数（Half word size） | `d`, `i`, `u`, `o`, `x`, `n` | `short int`, `unsigned short int` |
| **`hh`** | 读取字符大小的整数 | `d`, `i`, `u`, `o`, `x`, `n` | `signed char`, `unsigned char` |
| **`l`** | 读取长整数 | `d`, `i`, `u`, `o`, `x`, `n` | `long int`, `unsigned long int` |
| **`ll`** | 读取超长整数 | `d`, `i`, `u`, `o`, `x`, `n` | `long long int`, `unsigned long long int` |
| **`l`** | 读取双精度浮点数 | `f`, `e`, `g`, `a` | `double` (注意：`%f` 读取 `float`) |
| **`L`** | 读取超长双精度浮点数 | `f`, `e`, `g`, `a` | `long double` |
| **`z`** | 读取 `size_t` 类型（无符号） | `d`, `i`, `u`, `o`, `x`, `n` | `size_t` |
| **`j`** | 读取最大宽度整数 | `d`, `i`, `u`, `o`, `x`, `n` | `intmax_t`, `uintmax_t` |
| **`t`** | 读取指针差值类型 | `d`, `i`, `u`, `o`, `x`, `n` | `ptrdiff_t` |

一个不能总是正确接收参数的`fscanf()`

~~~C
  int a, b, c;
  a = b = c = 0;
  FILE *f = (FILE *)fopen("./test.txt", "r+");
  FILE *f1 = (FILE *)fopen("./testout.txt", "r+");
  if (f == NULL || f1 == NULL) {
    perror("Failed to read from stream test.txt.\n");
    return EXIT_FAILURE;
  }

  if (fscanf(f, "%d %d", &a, &b) ==
      2) { // 这里如果接收的不是两个整型变量就会导致循环终止，且fscanf跳过空白字符，
           // 所以它没有办法验证这两个值是位于同一行还是分属于两个不同的输入行
    fprintf(stdout, "Two number i got from stream f to stdout is %d - %d\n", a,
            b);
  }

  // 重置文件指针到文件开头
  rewind(f);

  int nfield = fscanf(f, "%4d %4d %4d", &a, &b, &c);
  if (nfield == 2)
    fprintf(f1, "Two number i got from stream f to f1 is %d - %d", a, b);
  else if (nfield == 3)
    fprintf(f1, "Three number i got from stream f to f1 is %d - %d - %d", a, b,
            c);

  fclose(f1);
  fclose(f); 
~~~

一个更为可靠的方法读取这种类型的`fscanf()`

~~~C
#include <stdio.h>

#define BUFFER_SIZE 100

void function(FILE *input)
{
  int a, b, c, d, e;
  char buffer[BUFFER_SIZE];
  
  while (fgets(buffer, BUFFER_SIZE, input) != NULL){
    if (sscanf(buffer,"%d %d %d %d %d", &a, &b, &c, &d, &e) != 4)
    {
      fprintf(stderr,"Bad input skipped: %s", buffer);
      continue;
    }
  }
  // 处理这组输入
}
~~~

### 15.10.3 printf家族

~~~C
int fprintf(FILE *stream, char const *format, ...);
int printf(char const *format, ...);
int sprintf(char *buffer, char const *format, ...);
~~~

> `sprintf()`被认为是有缺陷的(不安全的)，主要因为它存在固有的缓冲区溢出(Buffer Overflow)风险。
>
> 当 buffer被设置为一个固定大小的缓冲区时会有可能超出限制，且无法阻止其**继续覆盖相邻的内存**。
>> C99 标准引入了 `snprintf` 解决`sprintf`的安全问题。

~~~C
int snprintf(char *str, size_t size, const char *format, ...);
~~~

### 15.10.4 printf 格式代码

**`printf`家族格式代码和`scanf`格式代码类似**

几个使用`printf`格式代码的例子

1. 用`printf`格式字符串

|格式代码|转换后的字符串|||
|:---:|:---:|:---:|:---:|
|%s|A|ABC|ABCDEFGH|
|%5s|[][][][]A|[][]ABC|ABCDEFGH|
|%.5s|A|ABC|ABCDE|
|%5.5s|[][][][]A|[][]ABC|ABCDE|
|%-5s|A[][][][]|ABC[][]|ABCDEFGH|

> `%.5s` 中的`.5`是限制精度(限制字符数)，`%.5d`中的`.5`是限制宽度的，而`%5d`是限制精度(限制数字位数)。

2. 用`printf`格式化整数

|格式代码|转换后的数值||||
|:---:|:---:|:---:|:---:|:---:|
|%d|1|-12|12345|123456789|
|%6d|[][][][][]1|[][][]-12|[]12345|123456789|
|%.4d|0001|-0012|12345|123456789|
|%6.4d|[][]0001|[]-0012|[]12345|123456789|
|%-4d|1[][][][]|-12[]|12345|123456789|
|%04d|0001|-012|12345|123456789|
|%+d|+1|-12|+12345|+123456789|

3. 用`printf`格式化浮点数

|格式代码|转换后的数值||||
|:---:|:---:|:---:|:---:|:---:|
||1|.01|.00012345|12345.6789|
|%f|1.000000|0.010000|0.000123|12345.678900|
|%10.2f|[][][][][][]1.00|[][][][][][]0.01|[][][][][][]0.00|[][]12345.67|
|%e|1.000000e+00|1.000000e-02|1.234500e-04|1.234568e+04|
|%.4e|1.0000e+00|1.0000e-02|1.2345e-04|1.2346e+04|
|%g|1|0.01|0.00012345|12345.7|

4. 用`printf`格式化大浮点值

|格式代码|转换后的数值|
|:---:|:---:|
||6.023e23|
|%f|6.02299999999999975882752.000000|
|%10.2f|6.02299999999999975882752.000000|
|%e|6.023000e+23|
|%.4e|6.0230e+23|
|%g|6.023e+23|

## 15.11 二进制I/O

- 把数据写到文件效率最高的方法是用二进制形式写入。二进制输出**避免了在数值转换为字符串过程中所涉及的开销和精度损失**。但二进制数据并非人眼所能阅读，所以这个技巧只有**当数据将被另一个程序按顺序读取时**才能使用。

`fread`函数用于读取二进制数据，`fwrite`函数用于写入二进制数据。

~~~C
size_t fread(void *buffer, size_t size, size_t count, FILE *stream);
size_t fwrite(void *buffer, size_t size, size_t count, FILE* stream);
~~~

`buffer`是一个指向用于保存数据的内存位置的指针，`size`是缓冲区中每个元素的字节数，`count`是读取或写入的元素数，当然`stream`是数据读取或写入的流。

一个例子

~~~C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 1. 定义一个存储数据的结构体
typedef struct {
  int id;
  char name[20];
  float salary;
} Employee;

// 辅助函数：打印结构体内容
void print_employee(const Employee *e) // const *类型 指向常量的指针
{
  fprintf(stdout, "ID: %d, Name: %-20s, Salary: %.2f\n", e->id, e->name,
          e->salary);
}

// 定义文件名
#define DATA_FILE "employees.bin"

int main(void) {
  // 2. 准备数据：一个结构体数组
  Employee staff_data[] = {{101, "Alice Johnson", 60000.00f},
                           {102, "Bob Smith", 75000.50f},
                           {103, "Charlie Brown", 50000.25f}};
  const size_t num_employees = sizeof(staff_data) / sizeof(Employee);

  // ------------------------------------------------------------------------
  // 第一步：使用 fwrite 将结构体数组写入文件（输出流）
  // ------------------------------------------------------------------------

  FILE *output_file = fopen(DATA_FILE, "wb"); // write binary
  if (output_file == NULL) {
    perror("Error opening output file");
    return EXIT_FAILURE;
  }

  // fwrite(ptr, size, count, stream)
  // ptr: 要写入的数据块的起始地址
  // size: 每个数据块的大小（这里是 Employee 结构体的大小）
  // count: 要写入的数据块的数量（这里是数组元素的数量）
  // stream: 文件流指针

  size_t written_count =
      fwrite(staff_data, sizeof(Employee), num_employees, output_file);

  if (written_count == num_employees) {
    fprintf(stdout, "成功将 %zu 个 Employee 记录写入文件：%s\n", written_count,
            DATA_FILE);
  } else {
    fprintf(stderr, "警告：写入失败或部分失败。\n");
  }

  fclose(output_file);

  // ------------------------------------------------------------------------
  // 第二步：使用 fread 从文件中读取结构体数组（输入流）
  // ------------------------------------------------------------------------

  FILE *input_file = fopen(DATA_FILE, "rb"); // read binary
  if (input_file == NULL) {
    perror("Error opening input file for reading");
    return EXIT_FAILURE;
  }

  // 3. 准备接收数据的缓冲区（创建一个新的数组来存储读取的数据）
  Employee read_data[num_employees];

  fprintf(stdout, "\n从文件读取数据并输出到标准输出(stdout)：\n");
  printf("--------------------------------------------------------\n");

  // fread(ptr, size, count, stream)
  // ptr: 存储读取数据的内存地址
  // size: 每个数据块的大小（这里是 Employee 结构体的大小）
  // count: 尝试读取的数据块的数量
  // stream: 文件流指针
  size_t read_count =
      fread(read_data, sizeof(Employee), num_employees, input_file);

  if (read_count == num_employees) {
    printf("成功读取 %zu 个 Employee 记录。\n", read_count);

    // 4. 将读取到的结构体数组元素输出到标准输出
    for (size_t i = 0; i < read_count; i++) {
      printf("Record %zu: ", i + 1);
      print_employee(&read_data[i]);
    }
  } else {
    fprintf(stderr, "警告：尝试读取 %zu 个记录，但只读取了 %zu 个。\n",
            num_employees, read_count);
  }

  fclose(input_file);

  // 清理创建的文件（可选）
  // remove(DATA_FILE);

  return EXIT_SUCCESS;
}
~~~

## 15.12 刷新和定位数据

当我们需要立即把输出缓冲区的数据进行物理写入时，应该使用`fflush`这个函数。例如，调用`fflush`函数保证调试信息实际打印出来，而不是保存在缓冲区中直到以后才打印。

~~~C
int fflush(FILE *stream);
~~~

在正常情况下，数据以线性的方式写入，这意味着后面写入的数据在文件中的位置是在以前所有写入数据的后面。C同时支持随机访问I/O，也就是以任意顺序访问文件的不同位置。
`ftell`和`fseek`函数支持上面的操作。

~~~C
long ftell(FILE *stream);
int fseek(FILE *stream, long offset, int from);
~~~

`ftell`返回流的当前位置，也就是说，下一个读取或写入将要开始的位置距离文件起始位置的偏移量(offset)。这个函数允许你保存一个文件的当前位置，这样你可能在将来回到这个位置。在二进制流中这个值就是当前位置距离文件其实位置之间的字节数。

在文本流中这个值表示一个位置，但它并不一定准确地表示当前位置和文件起始位置之间的字符数，因为有些系统将对行末字符进行翻译转换。但是，`ftell`函数返回的值总是可以用于`fseek`函数中，作为一个距离文件起始位置的偏移量。

`fseek`函数运行你在一个流中定位。这个操作将改变下一个读取或写入操作的位置。它的第一个参数是需要改变的流，第二个和第三个参数标识文件中需要定位的位置。

试图定位到一个文件的起始位置之前是一个错误。定位到文件尾之后并进行写入将扩展这个文件。定位到文件尾之后并进行读取将导致返回一条“到达文件尾”的信息。在二进制流中，从**SEEK_END**进行定位可能不被支持，所以应该避免。在文本流中，如果from是**SEEK_CUR**或**SEEK_END**，offset必须是零。如果from是**SEEK_SET**，offset必须是一个从同一个流中以前调用`ftell`所返回的值。

|如果from是|你将定位到...|
|:---:|:---:|
|SEEK_SET|从流的起始位置起offset个字节，offset必须是一个非负值|
|SEEK_CUR|从流的当前位置起offset个字节，offset可正可负|
|SEEK_END|从流的尾部位置起offset个字节，offset可正可负。如果是正值它将定位到文件尾的后面|

另外还有三个额外的函数，用一些限制更严的方式指执行相同的任务。

~~~C
void rewind(FILE *stream);
int fgetpos(FILE *stream, fpos_t *position);
int fsetpos(FILE *stream, fpos_t const *position);
~~~

`rewind`函数将读/写指针设置回指定流的起始位置。它同时清除流的错误提示标志。`fgetpos`和`fsetpos`函数分别是`ftell`和`fseek`函数的替代方案。

它们的主要区别在于这对函数接受一个指向`fpos_t`的指针作为参数。`fgetpos`在这个位置存储文件的当前位置，`fsetpos`把文件位置设置为存储在这个位置的值。

一个使用这些定位函数的例子

~~~C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define FILENAME "demo_file.txt"

int main(void) {
  FILE *fp;

  // ===================================================================
  // 1. 打开文件并写入数据 (使用 "w+" 模式允许读写)
  // ===================================================================

  fp = fopen(FILENAME, "w+");
  if (fp == NULL) {
    perror("Error opening file");
    return EXIT_FAILURE;
  }

  printf("--- 开始写入和控制文件指针 ---\n");

  // 写入第一个字符串
  fputs("ABCDEFGHIJKLMNOP", fp);
  printf("1. 写入 'ABCDEFGHIJKLMNOP'\n");

  // -- fflush 示例 --
  // 尽管没有换行符，fflush 也会强制将数据从缓冲区写入磁盘
  fflush(fp); // fputs没有写入换行符，这里本来fputs的
              // 第一个参数写入到缓冲区还未到fp中，但是
              // 执行fflush可以强制从缓冲区写入磁盘
  printf("2. 使用fflush 强制刷新数据到文件。\n");

  // -- ftell 和 fgetpos 示例 --

  long initial_pos = ftell(fp); // 记录当前位置 （通常是16，即字符串末尾）
  fpos_t saved_fpos;
  fgetpos(fp, &saved_fpos); // 记录当前位置到 fpos_t 结构体中

  printf("3. 当前文件指针位置(ftell): %ld\n", initial_pos);

  // 写入第二个字符串
  fputs("XYZ", fp);
  printf("4. 写入 'XYZ'。\n");

  // -- fssek 示例 --
  // fseek(stream, offset, origin);
  // origin: SEEK_SET 从文件开头， SEEK_CUR 从当前位置，SEEK_END 从文件末尾

  // 将指针 重新定位到第五个字符(索引5)
  fseek(fp, 5, SEEK_SET);
  printf("5. 使用 fseek(5, SEEK_SET) 跳转到索引5。\n");

  // 写入新数据 ，会覆盖掉原有的 'FGHI'
  fputs("1234", fp);
  printf("6. 写入 '1234' (覆盖掉原有的 'FGHI').\n");

  // -- fsetpos 示例 --

  // 将指针重新定位回之前 fgetpos 记录的位置 (initial_pos = 16)
  fsetpos(fp, &saved_fpos);
  printf("7. 使用 fsetpos 跳转回保存的位置(%ld)。\n", initial_pos);

  // 写入数据，会在 16 处 继续 写入
  fputs("999", fp);
  printf("8. 写入'999'。\n");

  // --- rewind 示例 ---
  rewind(fp);
  printf("9. 使用 rewind 将指针 重置到文件开头。\n");

  // ===================================================================
  // 2. 从开头读取最终文件内容
  // ===================================================================

  printf("\n--- 读取文件内容进行验证 ---\n");
  char buffer[50];

  // 尝试从头读取整个文件
  if (fgets(buffer, sizeof(buffer), fp) != NULL)
    printf("文件最终内容：%s\n", buffer);
  else
    printf("读取文件失败\n");

  fclose(fp);

  return EXIT_SUCCESS;
}
~~~

## 15.13 改变缓冲方式

两种改变流缓冲方式的函数

~~~C
void setbuf(FILE* stream, char *buf);
int setvbuf(FILE* stream, char *buf, int mode, size_t size);
~~~

`setbuf` 设置了另一个数组，用于对流进行缓冲。这个数组的字符长度必须为BUFSIZ(在stdio.h中定义)。为一个流自行指定缓冲区可以防I/O函数库为它动态分配一个缓冲区。如果用一个NULL参数调用这个函数，`setbuf`函数将关闭流的所有缓冲方式。字符准确地将程序所规定的方式进行读取和写入。

> 一个流缓冲区使用一个自动数组是很危险的。

`setvbuf`函数更为通用。`mode`参数用于指定缓冲的类型。**_IONBF**指定一个不缓冲的流，**_IOLBF**指定一个行缓冲流，**_IOLBF**指定一个行缓冲流。所谓行缓冲，就是每当一个换行符写入到缓冲区时，缓冲区便进行刷新。

`buf`和`size`参数用于指定需要使用的缓冲区。如果`buf`为NULL，那么`size`的值必须是0。
一般而言，最好用一个长度为BUFSIZ的字符数组作为缓冲区。

一个例子

~~~C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define FILENAME "big_buffer_test.txt"
#define CUSTOM_BUF_SIZE 4096 * 4 // 16 KB 的缓冲区大小

int main(void) {
  FILE *fp;
  char custom_buffer[CUSTOM_BUF_SIZE]; // 声明自定义的内存缓冲区

  // 1. 打开文件进行写入
  fp = fopen(FILENAME, "w");
  if (fp == NULL) {
    perror("Error opening file.");
    return EXIT_FAILURE;
  }

  // 2. 使用 setvbuf 设置为全缓冲模式， 并指定自定义缓冲区
  // 目标：只有当 16KB 缓冲区写满时，才进行一次磁盘写入操作
  int result = setvbuf(fp, custom_buffer, _IOFBF, CUSTOM_BUF_SIZE);

  if (result != 0) {
    fprintf(stderr, "setvbuf 设置失败!\n");
    fclose(fp);
    return EXIT_FAILURE;
  }

  printf("文件流已设置为 %zu 字节的全缓冲模式。\n", (size_t)CUSTOM_BUF_SIZE);

  // 3. 写入数据
  for (int i = 0; i < 100; i++) {
    fprintf(fp, "Line %d : This is buffered data.\n", i);
  }

  printf("数据已写入缓冲区，但可能尚未写入磁盘。\n");
  // 此时，数据仍在内存中的 custom_buffer 中，直到缓冲区满或关闭。

  // 4. 关闭文件(关闭时会自动冲刷缓冲区)
  fclose(fp);
  printf("文件已关闭，缓冲区内容已冲刷到磁盘。\n");

  // remove(FILENAME); // 清理原文件(可选)

  return EXIT_FAILURE;
}
~~~

## 15.14 流错误函数

下面的函数用于判断和管理流的状态

~~~C
int feof(FILE *stream);
int ferror(FILE *stream);
void clearerr(FILE* stream);
~~~

如果流当前处于文件尾，`feof`函数返回真。这个状态可以通过对流执行`fseek`、`rewind`或`fsetpos`函数来清除。`ferror`函数报告流的错误状态，如果出现任何读/写错误函数就返回真。最后`clearerr`函数对指定流的错误标志进行重置。

一个例子

~~~C
#include <stdio.h>
#include <stdlib.h>

#define FILENAME "status_demo.txt"

// 辅助函数：检查并报告文件状态
void report_status(FILE *fp, const char *message);

int main(void) {
  FILE *fp = NULL;
  int c;

  // 1. 创建并初始化文件
  fp = fopen(FILENAME, "w");
  if (fp == NULL)
    return EXIT_FAILURE;
  fputs("Hello C I/O.\n", fp);
  fclose(fp);

  // ===================================================================
  // 步骤 A: 正常读取直到 EOF (feof 示例)
  // ===================================================================

  fp = fopen(FILENAME, "r");
  if (fp == NULL)
    return EXIT_FAILURE;

  printf("1. 首次打开文件，指针位于开头。\n");
  report_status(fp, "状态A - 读取前");

  // 读取所有字符直到文件结束
  while ((c = fgetc(fp)) != EOF) {
    // 确保所有数据都被消耗
  }

  printf("\n2. 已读取文件所有内容(fgetc 返回 EOF)。\n");

  // 此时，文件指针越界，EOF标志被设置
  report_status(fp, "状态B - 读取到 EOF 之后");

  // ===================================================================
  // 步骤 B: 制造错误并清除 (ferror 和 clearerr 示例)
  // ===================================================================

  // 使用 fseek 强制将指针移动到文件末尾（但文件仍然是只读模式）
  // 尝试在只读文件上写入数据，在某些系统上会设置错误标志。
  fseek(fp, 0, SEEK_END);

  // 尝试写入数据，由于文件以 "r" 模式打开（只读），这将失败，并设置错误标志
  // 注意：虽然不能写入，但 ferror 通常在尝试一个非法操作后被设置。
  // 在本例中，我们尝试在只读文件上使用 fputc，它会失败并设置 ferror 标志。
  c = fputc('X', fp);

  // 检查 fputc 是否失败(通常返回 EOF)
  if (c == EOF) {
    printf("\n3. 尝试在只读流上写入数据(fputc)失败。\n");
  }

  // 此时，错误标志 ferror 被设置
  report_status(fp, "状态C - 尝试非法写入后");

  // clearerr 示例
  clearerr(fp);
  printf("4. 使用 clearerr() 清除了 EOF 和错误标志。\n");

  report_status(fp, "状态D - clearerr() 之后");

  fclose(fp);
  remove(FILENAME); // 清理文件

  return EXIT_FAILURE;
}

void report_status(FILE *fp, const char *message) {
  printf("\n--- %s ---\n", message);

  // feof(fp): 检测是否到达文件末尾
  if (feof(fp)) {
    printf("FE_EOF: 文件流已到达文件末尾 (EOF)。\n");
  } else {
    printf("FE_EOF: 文件流未到达文件末尾。\n");
  }

  // ferror(fp)：检测是否发生了 I/O 错误
  if (ferror(fp)) {
    printf("F_ERROR: 文件流发生 I/O 错误。\n");
  } else {
    printf("F_ERROR: 文件流状态正常。\n");
  }
}
~~~

## 15.15 临时文件

使用`tempfile()`函数创建一个以`wb+`模式打开的文本文件用来临时保存数据。当程序结束时这个文件便被删除`自动被执行remove()`函数。

~~~C
FILE *tmpfile(void);
~~~

> 如果想要文件以只读模式打开或不以`wb+`模式打开必须使用`fopen()`函数操作

可以使用`tmpnam()`函数为临时文件创建一个文件名
> tmpnam() 仅仅是生成一个唯一的文件名字符串，但不创建文件。你需要手动使用 fopen() 来创建和打开文件，并负责在程序结束时手动删除它。且**tmpnam**不安全！

~~~C
char *tmpnam(char *name);
~~~

两个例子

~~~C
# include <stdio.h>
# include <stdlib.h>
# include <string.h>
int main(void) {
  FILE *tmp_fp;
  char write_data[] = "Temporary data buffer";
  char read_buffer[100];

  // 1. 创建临时文件流
  // FILE* tmpfile(void);
  tmp_fp = tmpfile();

  if (tmp_fp == NULL) {
    perror("Failed to open tmpfile.\n");
    return EXIT_FAILURE;
  }

  printf("成功创建临时文件流。该文件将在程序退出时自动删除。\n");

  // 2. 写入数据到临时文件
  if (fputs(write_data, tmp_fp) != EOF) {
    printf("写入数据成功：\"%s\"\n", write_data);
  } else {
    perror("Error writing to temporary file");
  }

  // 3. 将文件指针重置到开头
  rewind(tmp_fp);

  // 4. 从临时文件读取数据
  if (fgets(read_buffer, sizeof(read_buffer), tmp_fp) != NULL) {
    printf("从临时文件读取数据：\"%s\"\n", read_buffer);
  } else {
    perror("Error reading from temporary file");
  }

  // 5. 关闭文件流
  // 当文件流关闭时，操作系统会自动删除这个临时文件

  if (fclose(tmp_fp) == 0) {
    printf("\n临时文件流关闭成功，临时文件已被删除。\n");
  } else {
    perror("Error closing temporary file");
  }

  return EXIT_SUCCESS;
}
~~~

~~~C
# include <stdio.h>
# include <stdlib.h>
# include <string.h>
# include <time.h>

int main(void) {
  char
      temp_filename[L_tmpnam]; // L_tmpnam 是 <stdio.h> 中的宏，保证缓冲区足够大
  FILE *fp;

  // 1. 生成一个唯一的文件名
  // 如果传入NULL， tmpnam 会使用 内部静态缓冲区，但我们使用局部数组更安全
  if (tmpnam(temp_filename) != NULL) {
    printf("生成的临时文件名是：%s\n", temp_filename);
  } else {
    fprintf(stderr, "tmpnam failed to generate temporary file.");
    return EXIT_FAILURE;
  }

  // 2. 手动创建和打开文件
  fp = fopen(temp_filename, "w");
  if (fp == NULL) {
    perror("Error opening the generated temporary file");
    return EXIT_FAILURE;
  }

  printf("手动创建并打开了文件。\n");

  // 3. 写入和关闭文件...
  fprintf(fp, "This is manually managed temporary data.\n");
  fclose(fp);

  // 4. 【重要】手动删除文件
  if (remove(temp_filename) == 0) {
    printf("手动删除了临时文件：%s\n", temp_filename);
  } else {
    perror("Error deleting temporary file");
  }
  return EXIT_SUCCESS;
}
~~~

## 15.16 文件操纵函数

有两个函数用于操纵文件但不执行任何输入/输出操作。

~~~C
int remove(char const *filename);
int rename(char const *oldname, char const *newname);
~~~

`remove`函数删除一个指定的文件。如果当remove被调用时文件处于打开状态，其结果取决于编译器。

`rename`函数用于改变一个文件的名字，从**oldname**改为**newname**。如果已经有一个**newname**的文件存在，其结果取决于编译器。

::: tip

1. 调试用`printf`后加`fflush`
2. 检查`fopen`返回值
3. 改变文件的位置将**丢弃**任何被退回到流的字符
4. 在使用`fgets`时指定较大的缓冲区
5. `gets`,`sprintf`溢出检测
6. 使用自动数组作为流的缓冲区时应多加小心
7. 使用`mkstemp`替代`tmpnam`
:::
