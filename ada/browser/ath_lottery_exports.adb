with Ath_Lottery;

package body Ath_Lottery_Exports is
   use type Ath_Lottery.Status_Code;

   Stored_Expected : Long_Float := 0.0;
   Stored_None : Long_Float := 0.0;
   Stored_Log10 : Long_Float := 0.0;
   Stored_At_Least : Long_Float := 0.0;
   Stored_Representable : Boolean := False;
   Stored_Exact_Zero : Boolean := False;
   Stored_At_Least_Exact : Boolean := False;
   Stored_Fraction : Boolean := False;
   Stored_Num : Long_Float := 0.0;
   Stored_Den : Long_Float := 1.0;
   Stored_X : Long_Float := 0.0;
   Stored_Expected_Max : Long_Float := 0.0;
   Stored_Used : Interfaces.Integer_32 := 0;
   Stored_Bought : Ath_Lottery.Sample_Values := (others => 0.0);
   Stored_Expected_Samples : Ath_Lottery.Sample_Values := (others => 0.0);
   Stored_Chance : Ath_Lottery.Sample_Values := (others => 0.0);
   Stored_Kind : Ath_Lottery.Sample_Kinds := (others => 0);

   function Flag (Value : Boolean) return Interfaces.Integer_32 is
   begin
      if Value then
         return 1;
      end if;
      return 0;
   end Flag;

   procedure Clear is
   begin
      Stored_Expected := 0.0;
      Stored_None := 0.0;
      Stored_Log10 := 0.0;
      Stored_At_Least := 0.0;
      Stored_Representable := False;
      Stored_Exact_Zero := False;
      Stored_At_Least_Exact := False;
      Stored_Fraction := False;
      Stored_Num := 0.0;
      Stored_Den := 1.0;
      Stored_X := 0.0;
      Stored_Expected_Max := 0.0;
      Stored_Used := 0;
      Stored_Bought := (others => 0.0);
      Stored_Expected_Samples := (others => 0.0);
      Stored_Chance := (others => 0.0);
      Stored_Kind := (others => 0);
   end Clear;

   function Ath_Lottery_F64
     (Tickets, Prizes, Bought : Long_Float) return Interfaces.Integer_32 is
      Status : Ath_Lottery.Status_Code;
   begin
      Ath_Lottery.Draw
        (Tickets, Prizes, Bought,
         Stored_Expected, Stored_None, Stored_Log10, Stored_At_Least,
         Stored_Representable, Stored_Exact_Zero, Stored_At_Least_Exact, Stored_Fraction,
         Stored_Num, Stored_Den, Stored_X, Stored_Expected_Max, Stored_Used,
         Stored_Bought, Stored_Expected_Samples, Stored_Chance, Stored_Kind, Status);
      if Status /= Ath_Lottery.Ok then
         Clear;
      end if;
      return Interfaces.Integer_32 (Status);
   end Ath_Lottery_F64;

   function Ath_Lottery_Expected return Long_Float is
   begin
      return Stored_Expected;
   end Ath_Lottery_Expected;

   function Ath_Lottery_None return Long_Float is
   begin
      return Stored_None;
   end Ath_Lottery_None;

   function Ath_Lottery_None_Representable return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Representable);
   end Ath_Lottery_None_Representable;

   function Ath_Lottery_None_Exact_Zero return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Exact_Zero);
   end Ath_Lottery_None_Exact_Zero;

   function Ath_Lottery_None_Log10 return Long_Float is
   begin
      return Stored_Log10;
   end Ath_Lottery_None_Log10;

   function Ath_Lottery_At_Least return Long_Float is
   begin
      return Stored_At_Least;
   end Ath_Lottery_At_Least;

   function Ath_Lottery_At_Least_Exact return Interfaces.Integer_32 is
   begin
      return Flag (Stored_At_Least_Exact);
   end Ath_Lottery_At_Least_Exact;

   function Ath_Lottery_Fraction_Valid return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Fraction);
   end Ath_Lottery_Fraction_Valid;

   function Ath_Lottery_Fraction_Num return Long_Float is
   begin
      return Stored_Num;
   end Ath_Lottery_Fraction_Num;

   function Ath_Lottery_Fraction_Den return Long_Float is
   begin
      return Stored_Den;
   end Ath_Lottery_Fraction_Den;

   function Ath_Lottery_X_Max return Long_Float is
   begin
      return Stored_X;
   end Ath_Lottery_X_Max;

   function Ath_Lottery_Expected_Max return Long_Float is
   begin
      return Stored_Expected_Max;
   end Ath_Lottery_Expected_Max;

   function Ath_Lottery_Sample_Count return Interfaces.Integer_32 is
   begin
      return Stored_Used;
   end Ath_Lottery_Sample_Count;

   function Ath_Lottery_Sample_Bought
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Stored_Used then
         return 0.0;
      end if;
      return Stored_Bought (Natural (Index));
   end Ath_Lottery_Sample_Bought;

   function Ath_Lottery_Sample_Expected
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Stored_Used then
         return 0.0;
      end if;
      return Stored_Expected_Samples (Natural (Index));
   end Ath_Lottery_Sample_Expected;

   function Ath_Lottery_Sample_Chance
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Stored_Used then
         return 0.0;
      end if;
      return Stored_Chance (Natural (Index));
   end Ath_Lottery_Sample_Chance;

   function Ath_Lottery_Sample_Kind
     (Index : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      if Index < 1 or else Index > Stored_Used then
         return 0;
      end if;
      return Stored_Kind (Natural (Index));
   end Ath_Lottery_Sample_Kind;
end Ath_Lottery_Exports;
