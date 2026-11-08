with Ada.Command_Line;
with Ada.Text_IO;
with Ada.Unchecked_Conversion;
with Interfaces;
with Ath_Addition;
with Ath_Addition_Exports;

--  Self-checking native fixture. Successful runs also print FIXTURE lines
--  whose bits are the oracle for the WebAssembly build of the same units.
procedure Addition_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Addition.Status_Code;

   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);
   function To_Float is new Ada.Unchecked_Conversion (Bits, Long_Float);

   Failures : Natural := 0;

   function Hex (Value : Bits) return String is
      Alphabet : constant String := "0123456789abcdef";
      Image    : String (1 .. 16) := (others => '0');
      Rest     : Bits := Value;
   begin
      for Index in reverse Image'Range loop
         Image (Index) := Alphabet (Natural (Rest mod 16) + 1);
         Rest := Rest / 16;
      end loop;
      return Image;
   end Hex;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   procedure Check (Condition : Boolean; Name : String) is
   begin
      if not Condition then
         Fail (Name);
      end if;
   end Check;

   procedure Emit
     (Name   : String;
      Left   : Long_Float;
      Right  : Long_Float;
      Status : Ath_Addition.Status_Code;
      Result : Long_Float)
   is
   begin
      Ada.Text_IO.Put_Line
        ("FIXTURE " & Name & " " &
         Hex (To_Bits (Left)) & " " &
         Hex (To_Bits (Right)) & " " &
         Interfaces.Integer_32'Image (Interfaces.Integer_32 (Status)) & " " &
         Hex (To_Bits (Result)));
   end Emit;

   procedure Expect_Sum
     (Name          : String;
      Left, Right   : Long_Float;
      Expected      : Long_Float)
   is
      Result : Long_Float;
      Status : Ath_Addition.Status_Code;
   begin
      Ath_Addition.Add (Left, Right, Result, Status);
      if Status /= Ath_Addition.Ok or else Result /= Expected then
         Fail (Name);
      end if;
      if To_Bits (Result) /= To_Bits (Expected) then
         Fail (Name & " bits");
      end if;
      Emit (Name, Left, Right, Status, Result);
   end Expect_Sum;

   procedure Expect_Error
     (Name        : String;
      Left, Right : Long_Float;
      Expected    : Ath_Addition.Status_Code)
   is
      Result : Long_Float := 42.0;
      Status : Ath_Addition.Status_Code := Ath_Addition.Ok;
   begin
      Ath_Addition.Add (Left, Right, Result, Status);
      if Status /= Expected or else Result /= 0.0 then
         Fail (Name);
      end if;
      Emit (Name, Left, Right, Status, Result);
   end Expect_Error;

   function Quiet_NaN return Long_Float is
   begin
      return To_Float (16#7FF8_0000_0000_0001#);
   end Quiet_NaN;

   function Positive_Infinity return Long_Float is
   begin
      return To_Float (16#7FF0_0000_0000_0000#);
   end Positive_Infinity;

   Export_Status : Interfaces.Integer_32;
begin
   Check (Long_Float'Size = 64, "binary64 size");
   Check (Long_Float'Digits >= 15, "binary64 digits");

   Expect_Sum ("two-plus-three", 2.0, 3.0, 5.0);
   Expect_Sum ("zero-plus-zero", 0.0, 0.0, 0.0);
   Expect_Sum ("negative-left", -2.0, 5.0, 3.0);
   Expect_Sum ("negative-both", -2.0, -3.0, -5.0);
   Expect_Sum ("negative-sum", 1.0, -4.0, -3.0);
   declare
      Tenth : Long_Float := 0.1;
      Fifth : Long_Float := 0.2;
   begin
      --  Runtime addition of the already rounded operands, not a static
      --  universal-real sum.
      Expect_Sum ("tenth-plus-fifth", Tenth, Fifth, Tenth + Fifth);
   end;
   Expect_Sum ("negative-zero", -0.0, -0.0, -0.0);

   Expect_Error
     ("nan-left", Quiet_NaN, 1.0, Ath_Addition.Non_Finite_Input);
   Expect_Error
     ("infinity-right", 1.0, Positive_Infinity, Ath_Addition.Non_Finite_Input);
   Expect_Error
     ("overflow-positive",
      Long_Float'Last, Long_Float'Last, Ath_Addition.Result_Not_Finite);
   Expect_Error
     ("overflow-negative",
      Long_Float'First, Long_Float'First, Ath_Addition.Result_Not_Finite);

   Export_Status := Ath_Addition_Exports.Ath_Add_F64 (2.0, 3.0);
   Check
     (Export_Status = 0 and then Ath_Addition_Exports.Ath_Last_Sum = 5.0,
      "export two-plus-three");
   Export_Status := Ath_Addition_Exports.Ath_Add_F64 (Quiet_NaN, 1.0);
   Check
     (Export_Status = Ath_Addition.Non_Finite_Input
        and then Ath_Addition_Exports.Ath_Last_Sum = 0.0,
      "export clears a stale sum");

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("NATIVE OK");
   else
      Ada.Text_IO.Put_Line ("NATIVE FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Addition_Tests;
